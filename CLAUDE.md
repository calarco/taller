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

`getModel(userId, model)` in `src/lib/server/db.js` picks the right DB and registers schemas on first use. `initDatabase()` runs from the `init` hook — once on success, but **again on every request while it keeps failing**, which is why the connection listeners are behind a module-level guard.

Always reach models through `getModel()` — never import a model and call it directly, or you will query the wrong database.

`initDatabase` deliberately does **not** register models: `mongoose.connect()` resolves to the Mongoose singleton, not a `Connection`, so registering there targets a registry nothing reads. Every tenant connection gets its own models via `getModel`.

**The `userId` is the database name**, so it has to match `^[a-z0-9_-]{1,63}$`. MongoDB rejects `/ \ . " $ * < > : | ?` and caps names at 63 bytes; break that and you get an account that 500s on every request.

**There is no sign-up, and adding one is a mistake.** Accounts are created by inserting a document into `taller.users` by hand — `userId`, a `bcrypt.hash(password, 10)`, and a `name` (the estimate header renders it, and `editUserAction` refuses to save a profile without one). Every route sits behind the auth wall, so a sign-up form is only ever reachable by an already-logged-in user; that makes any account — the `demo` one especially — a way to create unbounded tenant databases that nothing cleans up.

### Auth flow

`src/hooks.server.js` validates the JWT on every request (cookies: `auth-token`, `userId`) and sets `event.locals.userId`. Unauthenticated requests are redirected to `/login`; authenticated requests to `/login` are redirected to `/`. Every `load` and action reads `event.locals.userId` and returns early without it.

### Error handling

Every server-side `catch` ends in `handleServerError(err, context)` from `src/lib/server/errors.js`. It re-throws redirects and `HttpError`s untouched and logs anything else before wrapping it as a 500. **Never re-wrap inside a catch block.** Wrapping a caught error in a fresh `error(500, …)` flattens a deliberate 400 or 404 into a 500, and turns a caught `redirect()` into a 500 reading `[object Object]`.

Choosing how to fail:

- **`fail(400, { <field>Error: 'mensaje' })`** for anything the user can correct. The key must be `<field>Error`; `use:enhance` copies `result.data` into `windowState.error` and `Label.svelte` renders it beside that field. A key no `<Label>` reads — or a field not wrapped in `Label` — is invisible, which is why delete dialogs use `error()` instead.
- **`error(404, …)`** for missing entities, **`error(400, …)`** for a missing form id, **`error(500, …)`** only for genuine faults. These surface through `src/routes/+error.svelte`, which shows the status.

**Only an action may return `fail()`.** A shared helper returns data or throws. A helper that returns an `ActionFailure` is read as a document by its callers: they take `.someId` off it, get `undefined`, and persist that while the action reports success. A duplicate check that produces a user-facing message belongs in the action, not the helper.

**Logging lives in `handleServerError`, not in the `handleError` hook.** SvelteKit treats `HttpError` as _expected_ and never passes it to `handleError`, and every controller throws one — so a hook alone would log almost nothing. The hook in `hooks.server.js` is the secondary net for what escapes `resolve` untouched.

**`src/error.html` is not decoration.** `+error.svelte` lives inside the root layout, so an error thrown from `+layout.server.js` — the database being unreachable, mainly — cannot render it and falls through to `error.html`. The two are styled to match; change one and change the other. It only appears on a full page load; a client-side navigation renders `+error.svelte`.

### Data layer

- **Models:** `src/lib/server/models/` — Mongoose schemas, numeric auto-increment IDs per entity, cross-collection links exposed as virtuals (e.g. `Vehicle.carModel`, `Vehicle.client`, `Vehicle.repairs`)
- **Controllers:** `src/lib/server/controllers/` — business logic; each exports both query helpers (`findVehicle`, `findRepairs`, …) and form-action handlers (`upsertVehicleAction`, …)
- **Pattern:** lean queries, `_id`/`__v` excluded, `structuredClone` before returning from a `load`

**IDs come from `getNextId(userId, key, findMax)` in `db.js`, never from reading the current maximum.** It `$inc`s a per-tenant `Counter` document (`{ _id: 'client', seq: 52 }`). Reading the max and adding one is worse than racy: creates are upserts keyed on the id just computed, so two concurrent creates pick the same id and the second **overwrites the first** instead of failing. `findMax` is a collation-aware numeric sort for the highest existing id; it runs once per tenant per entity to seed the counter, so a database without one continues its existing sequence.

### Routing

```
/                        → dashboard (requires auth)
/login                   → auth page, and the landing page (see below)
/[clientId]              → client detail
/[clientId]/[vehicleId]  → vehicle detail
/estimate/[estimateId]   → estimate (supports print-to-PDF)
/search?q=&type=         → JSON search endpoint (+server.js, no page)
/cars                    → JSON car makes + models (+server.js, no page)
```

**`src/routes/+page.svelte` and `src/routes/[clientId]/+page.svelte` are empty files.** The UI for those routes lives entirely in the layouts above them. Don't go looking for the dashboard in `+page.svelte`.

### Where data loading lives

Five files export a `load`:

| File                                     | Returns                                             |
| ---------------------------------------- | --------------------------------------------------- |
| `+layout.server.js` (root)               | `user`, `appointments`, `search` — on every request |
| `+layout.js` (root, **universal**)       | `carMakes`, `carModels` — fetched from `/cars`      |
| `[clientId]/+layout.server.js`           | `client`, `vehicles`                                |
| `[clientId]/[vehicleId]/+page.server.js` | `repairs`                                           |
| `estimate/[estimateId]/+page.server.js`  | `estimate`, `html`                                  |

**`appointments` and `search` must stay in the root layout**, not move to the routes whose panels show
them. Both panels are mounted once by the root layout in the `panel-left` / `panel-right` cells, and
route panels later in the DOM cover them. Loading each dataset only where its panel is visible looks
tighter, but re-queries on every hop between two routes that both show it — `/` ↔ `/estimate/…` for the
calendar, `/` ↔ `/[clientId]` for search.

The root layout reads no `params` and no `url`; that is what makes it run once per full page load and
never on client-side navigation. Keep it that way. The cost is that a hard load of
`/[clientId]/[vehicleId]` fetches `appointments` and `search` it cannot show.

**Never call `event.parent()` in a server load.** Server loads keep no state between requests, so
`parent()` re-executes the parent server loads in that request. Query directly instead — the estimate
page calls its own `findUser` rather than reaching for the root layout's `user`.

**`getSearch` batches its client hydration; never `populate` with `perDocumentLimit`,** which issues
one query per parent document. Fetch all vehicles for the matched clients in one sorted query and pick
the newest per client in JS.

**`carMakes`/`carModels` sit in the root universal `+layout.js`, which fetches `/cars`.** `invalidate()`
re-runs a whole load function, so sharing the server load would mean re-running all of it; this way
`CarForm`'s `invalidate('/cars')` re-runs only the two car queries. Two traps:

- Return `{ ...data, ...cars }`. With both `+layout.server.js` and `+layout.js` on a route, the
  universal load's return value **replaces** the server load's data for that level — returning only the
  cars drops `user`/`appointments`/`search` and every panel renders empty.
- Don't read `event.url` to skip the fetch on `/login`, or it re-runs on every navigation. `/login` is
  covered by `response.ok` plus a `try`/`catch` around `.json()`: hooks redirects unauthenticated
  requests, so the body is HTML. Reading response headers instead would need
  `filterSerializedResponseHeaders` in hooks.

`Day.svelte`, `Search.svelte` and `VehicleForm.svelte` guard with `?? []` because the root load returns
nothing without a `userId`.

### Shared vs route-specific actions

`Bar`, `Appointments`, `ClientForm` and `EstimateForm` live in the **root layout**, so they render on every route, and a `?/name` form posts to whichever route is currently active. Their actions therefore have to exist on every route.

They live once in `src/lib/server/actions.js` as `sharedActions`, and each route spreads them in:

```js
export const actions = { ...sharedActions, upsertVehicle, deleteVehicle, upsertRepair, deleteRepair };
```

**A new action reachable from a root-layout component belongs in `sharedActions`, not in one route file.** Putting it in a single `+page.server.js` makes the form 404 on every other route. Route-specific actions (`upsertRepair`, `deleteVehicle`, `sendEstimate`, …) stay in the route that owns them.

### The demo tenant

`demo` (password `demo`) is a throwaway account. `resetDemo` reloads its tenant database from
`src/lib/server/demo-fixture.json` on demo login; it no-ops for other accounts and swallows its own
errors, the one place that skips `handleServerError` — a failed reset must not break signing in.
Logging out does **not** reset: the next sign-in already does it, so doing both only doubles the work
and slows down the one path the user is waiting on. Regenerate the fixture with `npm run demo:fixture`
(committed, in `.prettierignore`).

- The fixture stores **day offsets, not dates**. A new date field must be added to `dateFields` in
  `Demo.controller.js`: Mongoose casts a bare number in a `Date` field to epoch milliseconds, so a
  missed field lands in 1970 instead of throwing.
- `insertMany` needs `{ timestamps: false }`, or Mongoose overwrites `createdAt`/`updatedAt` and the
  whole history collapses onto today. Clear with `deleteMany({})`, not `drop()`, which discards the
  declared indexes. `Counter` is cleared but never reloaded — `getNextId`'s `findMax` re-seeds it.
- The `User` document is never touched; `editUser` is blocked instead, so the profile cannot drift.
  `sendEstimate` is blocked too, with `error(403, …)` rather than `fail()` because that email input is
  not wrapped in a `Label`. Both forms still render, `disabled`. Every other mutation lives inside the
  tenant, so the next reset undoes it.

### The landing page

`/login` renders a landing card — title, description, **Ingresar** and **Probar demo** — instead of the
form when `event.url.hostname` matches the list in `login/+page.server.js` — the public domain plus
localhost. Every other host gets the plain form, so future tenant subdomains are unaffected. `hooks`
already 307s `/` → `/login` anonymous and `/login` → `/` authenticated, so no routing changes were
needed; `Ingresar` just flips local state, it does not navigate.

- **Resolve the hostname in `load`, never in the component.** On the client `page.url.hostname` comes
  from `location`; on the server it comes from `ORIGIN || get_origin(headers)` in adapter-node. If an
  `ORIGIN` is ever set those disagree and hydration mismatches. A server-resolved boolean cannot.
- `/login` has **named actions** — `login` and `demo` — because SvelteKit forbids mixing a `default`
  action with named ones. `demoLoginAction` checks no password: it looks up `demo`, calls the shared
  `signIn` helper and `resetDemo`. Hardcoding `demo`/`demo` in the page instead would break silently
  the day the password changes.
- Neither action redirects. `update()` re-runs the load, and `hooks` does the redirect on that request.
- `vite dev` rejects an unrecognised `Host` header with a 403, so host-based behaviour can only be
  tested against `node build/index.js`, not `npm run dev`.

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

Mutations submit through `use:enhance`, which re-runs every `load` on the route by default. To scope that, pass `update({ invalidateAll: false })` and invalidate one load — see `CarForm.svelte`'s `invalidate('/cars')`. `page.data` is not writable, so patching it in place is not an option.

`Dialog.svelte` must **not** call `invalidateAll()` itself. Every delete/upsert controller throws `redirect(307, …)`, and for a redirect result `update()` already routes through `applyAction()` → `_goto(location, { invalidateAll: true })`. Adding an explicit call on top runs every load twice.

### UI layout

Two-panel grid (2fr left, 3fr right) defined in `src/routes/+layout.svelte`. Shared components live in `src/lib/components/`, with a subfolder per entity.

`Section.svelte` wraps every scrollable panel and renders the dismiss scrim (`<button class="overlay">`) when its `overlay` prop is set.

### Styling

`src/lib/app.css` is a single global stylesheet. There are no CSS frameworks and no utility classes; components add scoped `<style>` blocks on top.

- **Tokens** are oklch inside `light-dark()`, declared on `body`. Typography comes from `font:` shorthand variables (`--body1`, `--subhead1`, `--title`, …). Don't hardcode colours or font stacks.
- **Icons** are `.icon.<name>` rules using a `mask-image` data-URI. Add a rule rather than an `<img>`.
- **The global button rule** (`.button, button, input[type='submit']`) gives _every_ button a hover/`:focus-visible` background and a pointer cursor. To exempt one, add it to the `:not(.createButton, .overlay)` list in that rule — don't fight it with per-component overrides, which turns into a specificity war.
- **Selects** use Chrome's customizable-select (`appearance: base-select`, `::picker(select)`, `::picker-icon`) with an `@supports not (appearance: base-select)` fallback that draws the caret with gradients. Any select styling change needs checking in both branches.
- **Panel heights come from the grid.** `main` and `.panels` size their rows `minmax(0, 1fr)`, not `1fr`, so a tall panel cannot force the row open. **Do not give `.panel` an explicit height**; it stretches to its row, and its inner `Section` scrolls.

### Motion

Two layers drive animation and they share one set of values. CSS uses `--duration-*` and `--ease-in`/`--ease-out` on `body`; Svelte transitions use the presets in `src/lib/motion.js`. The `--ease-*` beziers are the CSS equivalents of `sineIn`/`sineOut`, so both layers curve identically. **Import a preset rather than writing `{ duration, easing }` inline, and use the tokens rather than raw seconds.**

- **Convention:** enter with `sineOut` / `--ease-out`, exit with `sineIn` / `--ease-in`; elements (`--duration-in` / `--duration-out`) move faster than the panels containing them (`--duration-panel-*`).
- **Hover is instant in, eased out** — the base rule carries the transition and the `:hover` rule sets `transition: none`. Don't invert this.
- **Never `transition: <time> <easing>` with no property** — that is `transition: all`. List the properties that actually change, and keep layout-triggering ones (like `font-weight`) out.
- `filter: blur()` and `background-position` are not composited. Prefer `transform`/`opacity`; never nest two blur transitions, and never animate `background-position` in a loop (see the transform-driven loading bar in `Bar.svelte`).
- `prefers-reduced-motion` is handled by one global block in `app.css`. Because Svelte compiles `fade`/`fly`/`slide`/`blur` to CSS animations, that block covers both layers. It sets `animation-duration: 0.01ms`, not `none`, because `Dialog.svelte` closes on `animationend`.

### Stacking

`.panel` sets `isolation: isolate`, so every panel is its own stacking context and **panels order purely by DOM position in `+layout.svelte`** — appointments/search, then route panels, then the client/estimate form panels. No panel needs a `z-index`; adding one is usually a sign something else is wrong.

Inside a panel use `--layer-sticky` → `--layer-card` → `--layer-scrim` → `--layer-form` → `--layer-error`. At the root use `--layer-bar` → `--layer-cover` → `--layer-loading` → `--layer-print`. The two scales never meet. A sticky header whose `z-index` leaks out of its panel gets painted under an incoming panel, because the `fly` transform makes that panel a stacking context for the duration of the transition.

### Dialog

`Dialog.svelte` does **not** close via `dialog.close()`. Firefox has no `overlay` property, so it drops the dialog out of the top layer the instant `close()` runs and the exit never renders. Instead `requestClose()` adds `.closing`, plays a keyframe exit while the dialog is still open, and calls `close()` on `animationend`, with a `setTimeout` backstop. **Add new close paths to `requestClose()`, not `close()`.**

The backdrop animates `opacity`, not `background-color`: `backdrop-filter` is not in any transition list, so fading the tint alone makes the blur snap on at full strength.

## Environment variables

Required in `.env`:

```
JWT_KEY=
MONGODB_URI=
MAIL_USER=
MAIL_PASS=
```
