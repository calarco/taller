# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repository.

## Commands

```bash
npm run dev            # dev server
npm run build          # production build (adapter-node)
npm run lint           # prettier --check + eslint
npm run format         # prettier --write
npm run demo:fixture   # regenerate src/lib/server/demo-fixture.json
```

No test suite. Correctness is enforced by ESLint (`eslint-plugin-svelte`) and by running the app.

Stack: SvelteKit 2 + Svelte 5 runes, Mongoose, JWT auth, `@sveltejs/adapter-node`. Estimates render with
`svelte-email` and mail through `nodemailer`. UI text is Spanish.

`.env` requires `JWT_KEY`, `MONGODB_URI`, `MAIL_USER`, `MAIL_PASS` (all imported via `$env/static/private`).

## Multi-tenant database isolation

Every user gets their own MongoDB database. The main `taller` DB holds only the `User` collection; all
other data (Client, Vehicle, Repair, Appointment, Estimate, CarMake, CarModel, Counter) lives in a per-user
DB named after their `userId`.

**Always reach models through `getModel(userId, model)` in `src/lib/server/db.js`** — importing a model and
calling it directly queries the wrong database. `initDatabase()` runs from the `init` hook and deliberately
registers no models: `mongoose.connect()` resolves to the Mongoose singleton, not a `Connection`, so
registration there targets a registry nothing reads. It re-runs on every request while it keeps failing,
which is why the connection listeners sit behind a module-level guard.

**The `userId` is the database name**, so it must match `^[a-z0-9_-]{1,63}$`. MongoDB rejects `/ \ . " $ * < > : | ?`
and caps names at 63 bytes; break that and the account 500s on every request.

**There is no sign-up, and adding one is a mistake.** Accounts are created by inserting into `taller.users`
by hand: `userId`, `bcrypt.hash(password, 10)`, and a `name` (the estimate header renders it, and
`editUserAction` refuses to save without one). Every route is behind the auth wall, so a sign-up form is
only reachable by a logged-in user — that makes any account, the `demo` one especially, a way to create
unbounded tenant databases nothing cleans up.

## Data layer

- `src/lib/server/models/` — Mongoose schemas. Cross-collection links are **virtuals** matched on the
  business id (`Vehicle.carModel`, `Vehicle.client`, `Vehicle.repairs`, `Repair.vehicle`, …), not ObjectIds.
- `src/lib/server/controllers/` — each exports query helpers (`findVehicle`, `findRepairs`, …) and form-action
  handlers (`upsertVehicleAction`, …).
- `repository(modelName, idField)` in `db.js` builds `find`/`findMany`/`create`/`upsert`/`touch`/`remove`/
  `removeMany`/`nextId`. `find`/`findMany` return an un-awaited lean Query, so callers chain
  `.sort()`/`.populate()`/`.limit()` — that is why `findVehicles(...).sort(...).populate(carModelPopulate)`
  works. `_id`/`__v` are projected out; `structuredClone` before returning from a `load`.
- `toPlain(doc)` strips `_id`/`__v` from a Mongoose document returned by `create`/`upsert`.

**IDs come from `repository(...).nextId(userId)`, never from reading the current maximum.** It `$inc`s a
per-tenant `Counter` document (`{ _id: 'client', seq: 52 }`), keyed on `idField` minus its `Id` suffix.
Reading the max and adding one is worse than racy: creates are upserts keyed on the id just computed, so two
concurrent creates pick the same id and the second **overwrites the first** instead of failing. The fallback
seeds the counter from the highest existing id with a numeric collation sort — once per tenant per entity —
so an existing database continues its sequence.

**Date-only fields are UTC midnight.** `toDate` in `validate.js` parses `YYYY-MM-DD` as `T00:00:00.000Z`, so
`Repair.date` and `Appointment.date` are instants at UTC midnight, not local. Read them back the same way:
`toISODate` (UTC getters) to compare, `timeZone: 'UTC'` to format. Local getters render the day before west of
Greenwich. To bound a query at today, use `toDayStart(new Date())`, which is UTC midnight of the _local_
calendar day — `setHours(0, 0, 0, 0)` is local midnight and excludes today's rows at UTC-3. `createdAt`/
`updatedAt` are ordinary timestamps and render local. The demo fixture stores day offsets, so `resetDemo`
snaps the fields in its `dayFields` map through `toDayStart` while the timestamps keep their time of day.

**`vehicleId` is the licence plate**, user-entered and uppercased, not an auto-increment. Editing it sends
`oldVehicleId` too: `upsertVehicle` finds by the old plate and `moveRepairs` re-points the repairs.
`Estimate.vehicleId` is the same plate string but is not required to match a Vehicle document.

## Auth

`src/hooks.server.js` validates the JWT on every request (`auth-token` cookie) and sets `event.locals.userId`.
Unauthenticated requests redirect to `/login`; authenticated requests to `/login` redirect to `/`. Every
`load` and action reads `event.locals.userId` and returns early without it. Login attempts are rate-limited
per client address by an in-memory bucket in `User.controller.js`.

## Error handling

Every server-side `catch` ends in `handleServerError(err, context)` from `src/lib/server/errors.js`. It
re-throws redirects and `HttpError`s untouched and logs anything else before wrapping it as a 500.
**Never re-wrap inside a catch block** — that flattens a deliberate 400/404 into a 500, and turns a caught
`redirect()` into a 500 reading `[object Object]`.

Choosing how to fail:

- **`fail(400, { <field>Error: 'mensaje' })`** for anything the user can correct. The key must be
  `<field>Error`; `enhanceSubmit` copies `result.data` into `windowState.error` and `Label.svelte` renders it
  beside that field. A key no `<Label>` reads — or a field not wrapped in `Label` — is invisible, which is
  why delete dialogs and the estimate email input use `error()` instead.
- **`error(404, …)`** for missing entities, **`error(400, …)`** for a missing form id, **`error(500, …)`** for
  genuine faults. These surface through `src/routes/+error.svelte`.

**Only an action may return `fail()`.** A shared helper returns data or throws; one that returns an
`ActionFailure` is read as a document by its callers, which take `.someId` off it, get `undefined`, and
persist that while the action reports success. A duplicate check with a user-facing message belongs in the
action, not the helper.

**Logging lives in `handleServerError`, not in the `handleError` hook.** SvelteKit treats `HttpError` as
_expected_ and never passes it to `handleError`, and every controller throws one. The hook is the secondary
net for what escapes `resolve` untouched.

**`src/error.html` is not decoration.** `+error.svelte` lives inside the root layout, so an error thrown from
`+layout.server.js` — the database being unreachable, mainly — cannot render it and falls through to
`error.html`. The two are styled to match; change one and change the other.

## Routing

```
/                        → dashboard (root layout only; +page.svelte is empty)
/[clientId]              → client detail (+page.svelte is empty; UI is in +layout.svelte)
/[clientId]/[vehicleId]  → vehicle repairs
/estimate/[estimateId]   → estimate, print-to-PDF
/login                   → auth page, and the landing page
/search?q=&type=&limit=  → JSON search endpoint (+server.js, no page)
/appointments?from=&to=  → JSON appointment paging endpoint (+server.js, no page)
/cars                    → JSON car makes + models (+server.js, no page)
```

### Where data loading lives

| File                                     | Returns                                          |
| ---------------------------------------- | ------------------------------------------------ |
| `+layout.server.js` (root)               | `user`, `appointments`, `search` — every request |
| `+layout.js` (root, **universal**)       | `carMakes`, `carModels` — fetched from `/cars`   |
| `[clientId]/+layout.server.js`           | `client`, `vehicles`                             |
| `[clientId]/[vehicleId]/+page.server.js` | `repairs`                                        |
| `estimate/[estimateId]/+page.server.js`  | `estimate`, `html`                               |

**`appointments` and `search` must stay in the root layout.** Both panels are mounted once by the root layout
in the `panel-left`/`panel-right` cells and route panels later in the DOM cover them. Loading each only where
its panel is visible re-queries on every hop between two routes that both show it.

The root layout reads no `params` and no `url` — that is what makes it run once per full page load and never
on client-side navigation. Keep it that way. The cost is that a hard load of `/[clientId]/[vehicleId]` fetches
`appointments` and `search` it cannot show, which is why each is only the **first page**: `MONTHS_PER_BLOCK`
months of upcoming appointments and `PAGE_AMOUNT` search rows. Everything past that is fetched by the client
stores, and paging is therefore fetch-driven rather than `load` + `invalidate` — a `load` that took a page
number would have to read `url`.

**Past appointments are not loaded here at all.** The panel sits behind the history toggle and most sessions
never open it, so `PastList` fetches its first page on mount.

**Never call `event.parent()` in a server load.** Server loads keep no state between requests, so `parent()`
re-executes the parent server loads in that request. Query directly instead — the estimate page calls its own
`findUser` rather than reaching for the root layout's `user`.

**`getSearch` batches its client hydration; never `populate` with `perDocumentLimit`,** which issues one query
per parent document. Fetch all vehicles for the matched clients in one sorted query and pick the newest per
client in JS.

**`carMakes`/`carModels` sit in the root universal `+layout.js`.** `invalidate()` re-runs a whole load
function, so sharing the server load would re-run all of it; this way `CarForm`'s `invalidate('/cars')`
re-runs only the two car queries. Two traps:

- Return `{ ...data, ...cars }`. With both a server and a universal load on a route, the universal load's
  return value **replaces** the server load's data for that level — returning only the cars drops
  `user`/`appointments`/`search` and every panel renders empty.
- Don't read `event.url` to skip the fetch on `/login`, or it re-runs on every navigation. `/login` is covered
  by `response.ok` plus a `try`/`catch` around `.json()`: hooks redirects unauthenticated requests, so the
  body is HTML.

`UpcomingList.svelte`, `Search.svelte` and `VehicleForm.svelte` guard with `?? []` because the root
load returns nothing without a `userId`. `Day.svelte` reads no `page.data`: its parent indexes the loaded
appointments by ISO date and passes that object down, so a day costs a lookup rather than a scan of the whole
list, and the two panels can feed it from different sources.

### Shared vs route-specific actions

`Bar`, `Appointments`, `ClientForm` and `EstimateForm` live in the **root layout**, so a `?/name` form posts
to whichever route is currently active. Their actions therefore have to exist on every route. They live once
in `src/lib/server/actions.js` as `sharedActions`, and each route spreads them in:

```js
export const actions = { ...sharedActions, upsertVehicle, deleteVehicle, upsertRepair, deleteRepair };
```

**A new action reachable from a root-layout component belongs in `sharedActions`**, not in one
`+page.server.js`, or the form 404s on every other route.

`/login` has **named actions** (`login`, `demo`) because SvelteKit forbids mixing a `default` action with
named ones. Neither redirects: `update()` re-runs the load and `hooks` does the redirect on that request.

## Client-side state

Svelte 5 `$state`/`$derived`/`$effect` throughout — no stores.

- `src/lib/shared.svelte.js` — `windowState` (`form`, `id`, `data`, `loading`, `error`) plus `openForm`/
  `closeForm`/`openDialog` and the date helpers. `loading` is refcounted through `startLoading`/`endLoading`,
  so never assign it directly. The root layout resets the form on navigation via `$effect`.
- `src/lib/forms.js` — `enhanceSubmit({ onResult, ...updateOptions })` is the submit handler every
  `use:enhance` passes; it toggles loading and copies `fail()` data into `windowState.error`. `postAction`
  does the same for a fetch-driven POST that isn't a real form submit (`CarForm`'s inline create).
- `src/lib/search.svelte.js` — `createSearch({ type })` wraps `/search` with a 200 ms debounce, an
  `AbortController` and a sequence guard. Use it rather than calling `/search` directly. Because those
  results come from a `fetch` and not a `load`, `invalidateAll()` cannot refresh them — only the recents in
  `page.data.search` — so `enhanceSubmit`/`postAction` call the module's `invalidateSearch()` on a `success`
  or `redirect` result and every mounted `createSearch` refetches its active query.
- `src/lib/appointments.svelte.js` — the `upcoming` and `past` paging stores, plus `invalidateAppointments()`.
  Module-level rather than component-level because `Appointments.svelte` wraps its `Section` in
  `{#key showPast}`, so both lists are destroyed and recreated on every toggle. `upcoming.extra` holds only
  the blocks **after** the one the root layout renders, so `UpcomingList` reads
  `[...page.data.appointments, ...upcoming.extra]`. That `{#key}` also carries the `userId`, because the
  calendar's own block list is component state: without it a deep-scrolled calendar survives a logout and
  renders months the cleared store can no longer fill.
- `src/lib/paging.js` — `MONTHS_PER_BLOCK`, `PAGE_AMOUNT` and `onVisible`, the
  `IntersectionObserver` action behind all three sentinels. Plain JS with no runes and no browser API at
  module scope, so the root server load and `Search.controller.js` import the constants from it: Rollup shakes
  `onVisible` out and the emitted server chunk is just the two constants. Both span the server/client
  boundary, which is the whole reason they live together. `MONTHS_PER_BLOCK` bounds the root load's query
  _and_ sizes the calendar's blocks, so the second block starts exactly where the server stopped; split them
  and a month is fetched twice or never. `PAGE_AMOUNT` is the search page size, the floor `getSearch` clamps
  `size` to — the SSR recents are the client's first page, so a smaller server default leaves `hasMore` false
  on arrival and the list never pages — and the number of rows `past.loadMore` gathers before it stops
  walking blocks backwards. `root` is
  `null` even though the scroller is the `.scroller` inside `Section.svelte`: intersection is computed against
  the viewport _after_ every ancestor clip rect, so a sentinel inside an `overflow-y: auto` box works. Unlike
  a one-shot observer it keeps observing, so the sentinel re-fires as content is appended below it. It ignores
  an intersection while that scroller does not overflow: rows enter with `slide`, so for a frame after a list
  is populated every row still has zero height and the sentinel sits in view — unguarded, that pages a second
  time on top of a list nobody has scrolled.
- `src/lib/holidays.js` — `holidays(year)`, a `Set` of `YYYY-MM-DD` for the Argentine feriados nacionales,
  memoised per year in a module-level `Map` because every `Day` asks for its own. `Day.svelte` colours a
  feriado exactly like a weekend, so the rules have to hold for any year the calendar scrolls to: fixed
  dates, Carnaval/Viernes Santo off Easter (Meeus), and the Ley 27.399 traslado — Tue/Wed back to the
  previous Monday, Thu/Fri forward to the next one. Local-time `Date`s throughout, matching `toLocalISODate`;
  the UTC-midnight convention is for stored instants, not for a calendar grid. Two things are deliberately
  absent because no rule derives them: the `días no laborables con fines turísticos`, decreed per year by
  the PEN, and a trasladable falling on a Saturday or Sunday, which Decreto 614/2025 lets the Jefatura de
  Gabinete move to either side at its discretion — that one stays where it falls. `Jueves Santo` is a día no
  laborable rather than a feriado and is out for the same reason.
- `src/lib/motion.js` — the `in:`/`out:` presets every transition imports.

**A mutation refetches a store's whole loaded window, not just the changed row.** `enhanceSubmit`/
`postAction` bump `invalidateAppointments()` beside `invalidateSearch()`, and `Appointments.svelte` reloads
`upcoming` (`start` → `horizon`) and `past` (its oldest loaded month → today) in one request each. Patching in
place would miss an appointment created into a block the store already holds, and re-paging from zero would
drift.

**Reload from an `$effect` through `untrack`.** Both reloads read store `$state` and then assign it, so an
effect that calls them subscribes to the store it is about to write and re-runs on every unrelated store
change. The effect in `Appointments.svelte` must depend on the version counter and nothing else. The paging
cursors themselves — `start`/`horizon` for upcoming, `edge` for past — are deliberately plain `let` rather
than `$state`, so sizing a request never creates a dependency.

**Both panels page on month ranges, not offsets or a row cursor.** A block's bound is a date, so inserting or
deleting an appointment inside the loaded window shifts nothing — the drift `skip`/`limit` suffers from
cannot arise. A cursor on `Appointment.date` alone would not work: every date is UTC midnight, so same-day
rows share a cursor value and `$lt` drops them, and the only tie-break — `appointmentId` — is a numeric
_string_, which sorts `'10' < '9'`. Month boundaries sidestep the tie entirely.

Past blocks run backwards from today and the panel renders only the days that hold an appointment, so a block
can come back empty across a quiet stretch. `past.loadMore` therefore loops until it has gathered
`PAGE_AMOUNT` rows or history runs out — without that, a quiet block would add no height, the sentinel would
never re-enter the viewport and the list would stall.

**Neither list requests a range it can already tell is empty.** Both branches answer
`{ appointments, … }` plus the date of the nearest appointment beyond the block — `older` for `type=past`,
`newer` for upcoming. Each comes from the same indexed `findOne` that would otherwise only report existence,
so the date costs nothing extra, and each store keeps it as its frontier.

They spend it differently, because only one of the two panels may skip months. Past renders just the days it
has, so `past.loadMore` anchors the next block on the month _after_ `older` instead of on the block it just
read, jumping a quiet stretch in one request; `older: null` ends the list. Upcoming must render every month
whether or not it holds anything, since each day is a create target — so the calendar still grows a block at
a time, but `upcoming.loadBlock` returns without fetching while `newer` is null or lands beyond the block.
Both frontiers are refreshed by `reload`, which is what lets an appointment created past the point where the
store stopped fetching still appear.

The saving is the whole cost of scrolling through empty time: a five-year gap in history takes 3 requests
instead of 14, and scrolling four years into an empty future takes 1 instead of 8. Anchored past blocks are
no longer on a fixed grid, which is invisible because that panel groups by the data it receives rather than
by the block.

`getSearch` takes a `limit` and scales its per-query ceiling with it, so scrolling re-requests the same query
at a larger size and **replaces** the list. There is no stable cursor across a ranked union of four
collections; growing the limit keeps ranking and dedup globally correct at the cost of a re-query.

Because that re-query raises `limit` before the rows arrive, `Search.svelte` guards `hasMore` with
`!search.settled`. A bare `results.length >= search.limit` goes false the instant `loadMore` runs and only
recovers when the response lands, so the sentinel unmounts for exactly as long as the fetch takes — invisible
locally, obvious on a throttled connection, and the one moment the strip is meant to be on screen.

Mutations re-run every `load` on the route by default. To scope that, pass update options through
`enhanceSubmit` and invalidate one load — see `CarForm.svelte`. `page.data` is not writable, so patching it in
place is not an option.

`Dialog.svelte` must **not** call `invalidateAll()`. Delete/upsert controllers throw `redirect(307, …)`, and
for a redirect result `update()` already routes through `applyAction()` → `_goto(…, { invalidateAll: true })`.

## UI

Two-panel grid (2fr left, 3fr right) defined in `src/routes/+layout.svelte`. Components live in
`src/lib/components/`, a subfolder per entity. `Section.svelte` wraps every scrollable panel and renders the
dismiss scrim (`<button class="overlay">`) when its `overlay` prop is set. `Form.svelte` is the shared
absolutely-positioned form shell; `Label.svelte` is the field wrapper that renders errors.

### Styling

`src/lib/app.css` is a single global stylesheet. No frameworks, no utility classes; components add scoped
`<style>` blocks.

- **Tokens** are oklch inside `light-dark()`, declared on `body`. Typography comes from `font:` shorthand
  variables (`--body1`, `--subhead1`, `--title`, …). Don't hardcode colours or font stacks.
- **Shadows** are the one token pair that isn't `light-dark()`. `--shadow` and `--shadow-variant` are a single
  ramp of straight-down layers, each layer's alpha a `color-mix` of `--shadow-color` scaled by
  `--shadow-strength`. Only those two switch on `prefers-color-scheme` — dark carries a much higher strength, because a
  shadow can only be so visible when `--shadow-color` sits 0.08 L below `--background`. Tune those two rather
  than duplicating the ramp, and keep the offsets vertical: a horizontal offset reads as a second light source
  next to every other shadow on screen. `--shadow-variant`'s per-layer alpha is _higher_ than `--shadow`'s on
  purpose — it is the low-elevation pair, so its shadow is tighter and darker where `--shadow` is wider and
  more diffuse. Light mode is the constraint: `--background` is `oklch(0.84)`, which leaves a shadow little
  range to darken into, and the layers composite, so a change reads on the whole stack rather than on any one
  alpha. Render a swatch on `--background` and compare against `box-shadow: none` before trusting a new value —
  at these alphas the two are easy to confuse.
- **Icons** are `.icon.<name>` rules using a `mask-image` data-URI. Add a rule rather than an `<img>`.
- **`.sentinel` and `.empty` are global**, because all three paging sentinels and every empty-state heading
  want the same shape. Neither needs a per-component override.
- **The global button rule** (`.button, button, input[type='submit']`) gives every button a hover/
  `:focus-visible` background and a pointer cursor. To exempt one, add it to the `:not(.createButton, .overlay)`
  list in that rule — don't fight it with per-component overrides.
- **Selects** use Chrome's customizable-select (`appearance: base-select`, `::picker(select)`, `::picker-icon`)
  with an `@supports not (appearance: base-select)` fallback drawing the caret with gradients. Any select
  styling change needs checking in both branches.
- **Panel heights come from the grid.** `main` and `.panels` size their rows `minmax(0, 1fr)`, so a tall panel
  cannot force the row open. **Do not give `.panel` an explicit height**; it stretches to its row and its
  inner `Section` scrolls.

### Stacking

`.panel` sets `isolation: isolate`, so **panels order purely by DOM position in `+layout.svelte`** —
appointments/search, then route panels, then the client/estimate form panels. No panel needs a `z-index`.

Inside a panel use `--layer-sticky` → `--layer-card` → `--layer-scrim` → `--layer-form` → `--layer-error`. At
the root use `--layer-bar` → `--layer-cover` → `--layer-cover-content` → `--layer-loading` → `--layer-print`.
The two scales never meet.
A sticky header whose `z-index` leaks out of its panel gets painted under an incoming panel, because the `fly`
transform makes that panel a stacking context for the duration of the transition.

### Hydration gate

The root layout renders `<main inert={!hydrated}>`, so the whole app is non-interactive — pointer, keyboard
_and_ tab order — until hydration, and `[inert] :is(.button, button, input[type='submit'])` in `app.css` greys
it with the same `--on-background-disabled` the `:disabled` block uses. Nearly every control is a `openForm`/
`openDialog`/`postAction` call that does nothing before the bundle lands, so the SSR paint would otherwise
render an app that looks live and swallows clicks. The un-greying rides the colour transition the global
button rule already declares.

- **`hydrated` is component-local `$state` flipped in `onMount`, not `browser` from `$app/environment`.**
  `browser` is a compile-time constant, so `inert={!browser}` folds to a static `inert={false}` in the client
  bundle — an attribute Svelte may skip during hydration, stranding the SSR'd `inert` in the DOM forever.
  `$derived` is wrong for the same reason in reverse: it evaluates during SSR, so the gate never renders —
  which is why `onMount` rather than the `$state`/`$effect` pair `svelte/prefer-writable-derived` rejects. It
  stays out of `shared.svelte.js` for the same reason `windowState` is a hazard there: that module-level
  `$state` is one singleton across every request the adapter-node process serves.
- **The `[inert]` rule must keep its `input[type='submit']` arm and stay after `button[type='reset']`.**
  `:is()` takes the specificity of its most specific argument, so the type selector lifts the rule to a tie
  with `button[type='submit']:not(:disabled)`, which source order then breaks. Drop either and every submit
  button renders `--secondary` while inert.
- **`error.html` gets no `inert`** — no layout and no JS run for that shell, so nothing would remove it. It is
  also why the `<noscript>` notice in `app.html` inlines its own styles: without JS the gate never lifts, and
  in `vite dev` the stylesheet is injected by JS and would not apply.

### Motion

CSS uses `--duration-*` and `--ease-in`/`--ease-out` on `body`; Svelte transitions use the presets in
`motion.js`. The `--ease-*` beziers are the CSS equivalents of `sineIn`/`sineOut`, so both layers curve
identically. **Import a preset rather than writing `{ duration, easing }` inline, and use the tokens rather
than raw seconds.**

- Enter with `sineOut` / `--ease-out`, exit with `sineIn` / `--ease-in`; elements (`--duration-in`/
  `--duration-out`) move faster than the panels containing them (`--duration-panel-*`).
- **Hover is instant in, eased out** — the base rule carries the transition and the `:hover` rule sets
  `transition: none`. Don't invert this.
- **Never `transition: <time> <easing>` with no property** — that is `transition: all`. List the properties
  that actually change and keep layout-triggering ones out.
- `filter: blur()` and `background-position` are not composited. Prefer `transform`/`opacity`; never nest two
  blur transitions, and never animate `background-position` in a loop (see the transform-driven loading bar in
  `Bar.svelte`).
- `prefers-reduced-motion` is handled by one global block in `app.css`. Because Svelte compiles
  `fade`/`fly`/`slide`/`blur` to CSS animations, that block covers both layers. It sets
  `animation-duration: 0.01ms`, not `none`, because `Dialog.svelte` closes on `animationend`.

### Dialog

`Dialog.svelte` opens with CSS transitions plus `@starting-style`, but does **not** close via `dialog.close()`.
Firefox has no `overlay` property, so it drops the dialog out of the top layer the instant `close()` runs and
the exit never renders. Instead `requestClose()` adds `.closing`, plays a keyframe exit while the dialog is
still open, and calls `close()` on `animationend` with a `setTimeout` backstop. **Add new close paths to
`requestClose()`, not `close()`.** The backdrop animates `opacity`, not `background-color`: `backdrop-filter`
is in no transition list, so fading the tint alone makes the blur snap on at full strength.

**A submit closes the dialog on every result except `failure`.** `failure` is the one the user can act on —
`Label` renders it beside the field, so the dialog has to stay put. `error` must close: the delete dialogs
deliberately throw `error()` rather than `fail()`, and an unreachable server turns any submit into one, so
matching only `success`/`redirect` leaves the dialog sitting on top of `+error.svelte` with the message
unreachable behind it.

## Estimates and email

`src/lib/components/estimate/Estimate.svelte` is built from `svelte-email` primitives, not ordinary markup, and
is rendered to an HTML **string** server-side with `render()` from `svelte/server`. The page `load` renders it
alone (`data.html`, injected with `{@html}`); `sendEstimateAction` renders `EstimateEmail.svelte`, which wraps
it in `Html`/`Head`/`Body` plus `Preview`, and mails that. Changing `Estimate.svelte` affects both. SMTP host
and port are hardcoded in `Estimate.controller.js`; only the credentials come from the environment.

**That wrapper is email-only.** `{@html}` drops the string mid-document, where the parser merges a second
`<body>`'s attributes onto the real one and its `font-family` overrides the app's. `<html>` accepts only
`<head>`/`<body>`/`<frameset>`, so `Preview` and the content sit inside `Body`, never directly under `Html`.

Print-to-PDF: the page copies its estimate node's `innerHTML` into the root layout's `#printContainer` and
calls `window.print()`; an `@media print` block hides everything else.

## The demo tenant

`demo` (password `demo`) is a throwaway account. `resetDemo` reloads its tenant database from
`src/lib/server/demo-fixture.json` on demo login; it no-ops for other accounts and swallows its own errors —
the one place that skips `handleServerError`, because a failed reset must not break signing in. Logging out
does **not** reset; the next sign-in already does.

- The fixture stores **day offsets, not dates**. A new date field must be added to `dateFields` in
  `Demo.controller.js`: Mongoose casts a bare number in a `Date` field to epoch milliseconds, so a missed
  field lands in 1970 instead of throwing.
- `insertMany` needs `{ timestamps: false }`, or Mongoose overwrites `createdAt`/`updatedAt` and the whole
  history collapses onto today. Clear with `deleteMany({})`, not `drop()`, which discards declared indexes.
  `Counter` is cleared but never reloaded — `nextId` re-seeds it from the highest existing id.
- The `User` document is never touched; `editUserAction` and `sendEstimateAction` are blocked instead, so the
  profile cannot drift. Both forms still render, `disabled`. Every other mutation lives inside the tenant, so
  the next reset undoes it.

## The landing page

`/login` renders a landing card — title, description, **Ingresar** and **Probar demo** — instead of the form
when `event.url.hostname` matches the list in `login/+page.server.js` (public domain plus localhost). Every
other host gets the plain form, so future tenant subdomains are unaffected. `Ingresar` just flips local state,
it does not navigate.

- **The `.cover` backdrop belongs to the root layout**, not to the pages that sit on it. It renders when
  `page.data.user` is missing or `page.error` is set, so it tints and blurs the app through a logout as well as
  a sign-in, and `/login` and `+error.svelte` contribute only their transparent centring grids (`.forms`,
  `.error`) at `--layer-cover-content`. That token exists because the backdrop and the content it carries live
  in different files, so DOM order cannot keep the backdrop underneath — share `--layer-cover` between them and
  whichever lands last swallows the clicks. Wrapping `{@render children()}` in the cover instead
  is not an option: the other routes need a second `{@render children()}`, and rendering that snippet twice
  mounts the page component twice. `src/error.html` keeps its own tint — no layout runs for it.
- **`Bar`, `Appointments` and `Search` stay mounted under the cover** and keep their client state across a
  logout, so anything session-scoped has to clear itself — `Search.svelte` watches `page.data.user` and resets
  the query when it goes missing.
- **Resolve the hostname in `load`, never in the component.** On the client `page.url.hostname` comes from
  `location`; on the server from `ORIGIN || get_origin(headers)` in adapter-node. If an `ORIGIN` is ever set
  those disagree and hydration mismatches. A server-resolved boolean cannot.
- `demoLoginAction` checks no password: it looks up `demo`, calls the shared `signIn` helper and `resetDemo`.
  Hardcoding `demo`/`demo` in the page would break silently the day the password changes.
- `vite dev` rejects an unrecognised `Host` header with a 403, so host-based behaviour can only be tested
  against `node build/index.js`, not `npm run dev`.
