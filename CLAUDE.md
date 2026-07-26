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

No test suite is configured.

## Architecture

**Stack:** SvelteKit 2 + Svelte 5, MongoDB/Mongoose, Node.js adapter, JWT auth.

### Multi-tenant database isolation

Every user gets their own MongoDB database. The main `taller` DB holds only the `User` collection. All other data (Client, Vehicle, Repair, Appointment, Estimate, CarMake, CarModel) lives in a per-user DB named after their `userId`. This is handled in `src/lib/server/db.js` via `mongoose.connection.useDb()` with connection caching.

### Auth flow

`src/hooks.server.js` validates JWT on every request (cookies: `auth-token`, `userId`). Unauthenticated requests redirect to `/login`. The `userId` from the token scopes all DB queries to that user's database.

### Data layer

- **Models:** `src/lib/server/models/` — Mongoose schemas, numeric auto-increment IDs per entity
- **Controllers:** `src/lib/server/controllers/` — business logic called from SvelteKit form actions
- **Pattern:** Lean queries, `__v` excluded, collation-aware numeric sorting

### Routing

```
/                        → dashboard (requires auth)
/login, /register        → public
/[clientId]              → client detail
/[clientId]/[vehicleId]  → vehicle detail
/estimate/[estimateId]   → estimate (supports print-to-PDF)
/search?q=&type=         → JSON search endpoint (+server.js, no page)
```

Each route has a `+page.server.js` with named form actions (SvelteKit `actions` API) for mutations. Load functions return serialized data for SSR.

### Client-side state

Svelte 5 `$state`/`$derived`/`$effect` runes throughout. Global UI state (modal open, loading, errors) lives in `src/lib/shared.svelte.js` (`windowState`). The root layout resets form/panel state on navigation via `$effect`.

### UI layout

Two-panel grid layout (2fr left, 3fr right). Components in `src/lib/components/` include: `Bar`, `Search`, `Card`, `Dialog`, `Form`, `Label`, `Overlay`, and subfolders per entity (`appointment/`, `client/`, `estimate/`, `repair/`, `vehicle/`).

## Environment variables

Required in `.env`:

```
JWT_KEY=
MONGODB_URI=
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
```
