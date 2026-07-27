# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Prettier check + ESLint
npm run format    # Auto-format with Prettier
```

No test suite is configured. Correctness is enforced by ESLint (with `eslint-plugin-svelte`) and by running the app.

## Architecture

**Stack:** SvelteKit 2 + Svelte 5 (runes), MongoDB/Mongoose, JWT auth, `@sveltejs/adapter-node`. Estimates are rendered with `svelte-email` and mailed with `nodemailer`. (`adapter-auto` is installed but unused — `svelte.config.js` uses the Node adapter.)

### Multi-tenant database isolation

Every user gets their own MongoDB database. The main `taller` DB holds only the `User` collection. All other data (Client, Vehicle, Repair, Appointment, Estimate, CarMake, CarModel) lives in a per-user DB named after their `userId`.

`src/lib/server/db.js` handles this: `getModel(userId, model)` picks the DB (`taller` for `User`, otherwise `userId`) via `mongoose.connection.useDb(name, { useCache: true })` and registers the schemas on first use. `initDatabase()` runs once from the `init` hook at server start.

Always reach models through `getModel()` — never import a model and call it directly, or you will query the wrong database.

### Auth flow

`src/hooks.server.js` validates the JWT on every request (cookies: `auth-token`, `userId`) and sets `event.locals.userId`. Unauthenticated requests are redirected to `/login`; authenticated requests to `/login` are redirected to `/`. Every `load` and action reads `event.locals.userId` and returns early without it.

### Data layer

- **Models:** `src/lib/server/models/` — Mongoose schemas, numeric auto-increment IDs per entity, cross-collection links exposed as virtuals (e.g. `Vehicle.carModel`, `Vehicle.client`, `Vehicle.repairs`)
- **Controllers:** `src/lib/server/controllers/` — business logic; each exports both query helpers (`findVehicle`, `findRepairs`, …) and form-action handlers (`upsertVehicleAction`, …)
- **Pattern:** lean queries, `_id`/`__v` excluded, `structuredClone` before returning from a `load`, collation-aware numeric sorting for ID generation

### Routing

```
/                        → dashboard (requires auth)
/login, /register        → auth pages
/[clientId]              → client detail
/[clientId]/[vehicleId]  → vehicle detail
/estimate/[estimateId]   → estimate (supports print-to-PDF)
/search?q=&type=         → JSON search endpoint (+server.js, no page)
```

**`src/routes/+page.svelte` and `src/routes/[clientId]/+page.svelte` are empty files.** The UI for those routes lives entirely in the layouts above them. Don't go looking for the dashboard in `+page.svelte`.

### Where data loading lives

Only four files export a `load`:

| File                                     | Returns                                                                      |
| ---------------------------------------- | ---------------------------------------------------------------------------- |
| `+layout.server.js` (root)               | `user`, `carMakes`, `carModels`, `appointments`, `search` — on every request |
| `[clientId]/+layout.server.js`           | `client`, `vehicles`                                                         |
| `[clientId]/[vehicleId]/+page.server.js` | `vehicle`, `repairs`                                                         |
| `estimate/[estimateId]/+page.server.js`  | `estimate`, `html`                                                           |

`/` and `/[clientId]` have **no** page load — their data comes from the layouts. Child loads reuse parent data with `await event.parent()` instead of re-querying (the vehicle page takes its `vehicle` from the parent's `vehicles` array; the estimate page takes `user` from the root layout).

### Shared vs route-specific actions

`Bar`, `Appointments`, `ClientForm` and `EstimateForm` live in the **root layout**, so they render on every route, and a `?/name` form posts to whichever route is currently active. Their actions therefore have to exist on every route.

They live once in `src/lib/server/actions.js` as `sharedActions` — `editUser`, `logout`, `createCarMake`, `createCarModel`, `upsertClient`, `upsertEstimate`, `createAppointment`, `deleteAppointment` — and each route spreads them in:

```js
export const actions = { ...sharedActions, upsertVehicle, deleteVehicle, upsertRepair, deleteRepair };
```

**A new action reachable from a root-layout component belongs in `sharedActions`, not in one route file.** Putting it in a single `+page.server.js` makes the form 404 on every other route. Route-specific actions (`upsertRepair`, `deleteVehicle`, `sendEstimate`, …) stay in the route that owns them.

### Estimates and email

`src/lib/components/estimate/Estimate.svelte` is built from `svelte-email` primitives, not ordinary markup. It is rendered to an HTML **string** server-side with `render()` from `svelte/server`, and the same component produces both:

- the page body — `load` returns it as `data.html`, injected with `{@html}`
- the email body — `sendEstimateAction` renders it again and mails it

Changing that component affects both. SMTP host and port are hardcoded in `Estimate.controller.js`; only the credentials come from the environment.

Print-to-PDF: the page copies `#print-content`'s innerHTML into the root layout's `#print-container` and calls `window.print()`; an `@media print` block hides everything else.

### Client-side state

Svelte 5 `$state`/`$derived`/`$effect` runes throughout — no stores.

- `src/lib/shared.svelte.js` — `windowState` global UI state (`form`, `id`, `data`, `loading`, `error`). The root layout resets it on navigation via `$effect`.
- `src/lib/search.svelte.js` — `createSearch({ type })`, a rune-based helper wrapping the `/search` endpoint with a 200 ms debounce, an `AbortController`, and a sequence guard against out-of-order responses. Used by `Search.svelte` and `VehicleForm.svelte`. Use it rather than calling `/search` directly.
- `src/lib/motion.js` — the `in:`/`out:` presets every Svelte transition imports (`flyEnter`, `blurExit`, `slideEnter`, `panelFlyExit`, …). See [Motion](#motion).

Mutations submit through `use:enhance`. By default a successful action re-runs every `load`, including the root layout's five queries — pass `update({ invalidateAll: false })` and patch `page.data` locally when an action only affects one visible thing (see `CarForm.svelte` and `AppointmentCard.svelte`).

### UI layout

Two-panel grid (2fr left, 3fr right) defined in `src/routes/+layout.svelte`. Components in `src/lib/components/`: `Bar`, `Card`, `CarForm`, `Dialog`, `Form`, `Label`, `Search`, `Section`, plus a subfolder per entity (`appointment/`, `client/`, `estimate/`, `repair/`, `vehicle/`).

`Section.svelte` wraps every scrollable panel and renders the dismiss scrim (`<button class="overlay">`) when its `overlay` prop is set.

### Styling

`src/lib/app.css` is a single global stylesheet (~880 lines). There are no CSS frameworks and no utility classes; components add scoped `<style>` blocks on top.

- **Tokens** are oklch inside `light-dark()`, declared on `body`. Typography comes from `font:` shorthand variables (`--body1`, `--subhead1`, `--title`, …). Don't hardcode colours or font stacks.
- **Icons** are `.icon.<name>` rules using a `mask-image` data-URI. Add a rule rather than an `<img>`.
- **The global button rule** (`.button, button, input[type='submit']`) gives _every_ button a hover/`:focus-visible` background and a pointer cursor. To exempt one, add it to the `:not(.createButton, .overlay)` list in that rule — don't fight it with per-component overrides, which turns into a specificity war.
- **Selects** use Chrome's customizable-select (`appearance: base-select`, `::picker(select)`, `::picker-icon`) with an `@supports not (appearance: base-select)` fallback that draws the caret with gradients. Any select styling change needs checking in both branches.
- **Panel heights come from the grid.** `main` and `.panels` size their rows with `minmax(0, 1fr)` so that a tall panel cannot force the row open — a bare `1fr` is `minmax(auto, 1fr)`, whose content-based minimum is not capped by the container. **Do not give `.panel` an explicit height**; it stretches to its row, and its inner `Section` scrolls.

### Motion

Two layers drive animation and they share one set of values. CSS uses `--duration-*` and `--ease-in`/`--ease-out` on `body`; Svelte transitions use the presets in `src/lib/motion.js`. The `--ease-*` beziers are the CSS equivalents of `sineIn`/`sineOut`, so both layers curve identically. **Import a preset rather than writing `{ duration, easing }` inline, and use the tokens rather than raw seconds.**

- **Convention:** enter with `sineOut` / `--ease-out`, exit with `sineIn` / `--ease-in`; elements (`--duration-in` / `--duration-out`) move faster than the panels containing them (`--duration-panel-*`).
- **Hover is instant in, eased out** — the base rule carries the transition and the `:hover` rule sets `transition: none`. Don't invert this.
- **Never `transition: <time> <easing>` with no property** — that is `transition: all`, which watches every animatable property. List the properties that actually change. Watch for layout-triggering ones sneaking in (`font-weight` on a search row was reflowing text every frame).
- `filter: blur()` and `background-position` are not composited. Prefer `transform`/`opacity`; never nest two blur transitions, and never animate `background-position` in a loop (see the transform-driven loading bar in `Bar.svelte`).
- `prefers-reduced-motion` is handled by one global block in `app.css`. Because Svelte compiles `fade`/`fly`/`slide`/`blur` to CSS animations, that block covers both layers. It sets `animation-duration: 0.01ms`, not `none`, because `Dialog.svelte` closes on `animationend`.

### Stacking

`.panel` sets `isolation: isolate`, so every panel is its own stacking context and **panels order purely by DOM position in `+layout.svelte`** — appointments/search, then route panels, then the client/estimate form panels. No panel needs a `z-index`; adding one is usually a sign something else is wrong.

Inside a panel use `--layer-sticky` → `--layer-card` → `--layer-scrim` → `--layer-form` → `--layer-error`. At the root use `--layer-bar` → `--layer-cover` → `--layer-loading` → `--layer-print`. The two scales never meet, which is the point of isolating. A sticky header whose `z-index` leaks out of its panel will be painted under an incoming panel, because the `fly` transform makes that panel a stacking context for the duration of the transition.

### Dialog

`Dialog.svelte` does **not** close via `dialog.close()`. Firefox has no `overlay` property, so it drops the dialog out of the top layer the instant `close()` runs and the exit never renders. Every close path — Cancelar, `oncancel` (Esc and `closedby="any"` light dismiss), and `use:enhance` success — goes through `requestClose()`, which adds `.closing`, plays a keyframe exit while the dialog is still open, and only then calls `close()` on `animationend`, with a `setTimeout` backstop so a skipped animation can't leave it stuck open. **Add new close paths to `requestClose()`, not `close()`.**

The backdrop animates `opacity`, not `background-color`: `backdrop-filter` is not in any transition list, so fading the tint alone makes the blur snap on at full strength.

## Environment variables

Required in `.env`:

```
JWT_KEY=
MONGODB_URI=
MAIL_USER=
MAIL_PASS=
```
