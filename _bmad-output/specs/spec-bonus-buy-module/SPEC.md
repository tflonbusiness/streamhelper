---
id: SPEC-bonus-buy-module
companions:
  - bonus-buy-module.md
  - bonus-buy-records.md
  - bonus-buy-slots.md
  - session-page.md
  - widget-page.md
  - ../spec-caz-team-dashboard/modules-catalog.md
  - ../spec-caz-team-dashboard/nav-shell.md
  - ../spec-caz-team-dashboard/SPEC.md
  - ../spec-app-english-only/SPEC.md
  - ../spec-caz-agent-ui-improvement/design-tokens.md
  - ../spec-caz-agent-ui-improvement/components.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Caz Agent — Bonus Buy module

## Why

**Opportunity:** **Bonus Buy** is a standalone slot bonus-buy engagement module. Operators need a catalog entry, a list/history page, a **session workspace** per record, and persistent slot entries with live stats. The placeholder session page and create-only flow are insufficient once operators run a bonus-buy on stream.

**Who:** Owner and admin on an active Caz Agent team (English UI, dark shadcn).

## Capabilities

- **CAP-1**
  - **intent:** An operator sees a **Bonus Buy** module card on `/modules` in the existing responsive grid.
  - **success:** Card renders with name **Bonus Buy**, description from `bonus-buy-module.md`, static **Available** badge, and the same `Card` + `IconTile` header layout as siblings; footer has **Open** only (no toggle); card is last in the grid; no Games-style sub-section on `/modules`.

- **CAP-3**
  - **intent:** An operator opens the Bonus Buy widget from the module card.
  - **success:** Card footer shows **Open** button; click navigates to `/bonus-buy`; button always visible (no enable state).

- **CAP-4**
  - **intent:** An operator reaches the Bonus Buy history page inside the app shell.
  - **success:** `/bonus-buy` renders `PageHeader` (title **Bonus Buy**, `Gift` icon, description per `widget-page.md`), a create action, and a history table per `bonus-buy-records.md`; page uses `AppShell`; direct URL works for any active-account operator.

- **CAP-5**
  - **intent:** An operator creates a bonus buy record for the current account from the history page.
  - **success:** **New bonus buy** opens a dialog with **Title** and **Start balance** (USD, cents); valid submit calls `POST /accounts/:accountId/bonus-buys`; row persists with `is_active = true`, `created_by_user_id` from session, and server `created_at`; dialog closes and table refreshes without full page reload.

- **CAP-6**
  - **intent:** An operator sees the history of bonus buy records for the current account on the history page.
  - **success:** On load, `GET /accounts/:accountId/bonus-buys` populates a table with columns title, start balance (`$X.XX`), active status, created by (user name), and created date; rows sorted newest first; each row has **Open** linking to `/bonus-buy/:id`; empty, loading, and error states handled; only the session account's records appear.

- **CAP-7**
  - **intent:** An operator opens a bonus buy session and sees the full session workspace for that record.
  - **success:** `/bonus-buy/:id` loads the account-scoped record; layout matches `session-page.md` zones (header bar, stats strip, quick-add panel, bonus list); invalid or foreign id shows error with path back to `/bonus-buy`; loading uses skeletons per companion.

- **CAP-8**
  - **intent:** An operator uses the session header toolbar to navigate, start a new session, and access stream tools.
  - **success:** Back and exit return to `/bonus-buy`; title displays `{title} #{id}` with edit affordance; **+ New session** opens create dialog and navigates to new session on success; **Widget style**, **OBS link**, and **Overlay** secondary buttons render per `session-page.md`.

- **CAP-9**
  - **intent:** An operator sees live session statistics derived from slot data.
  - **success:** Five stat cards show **Start balance**, **Current balance** (emerald styling), **Spent**, **Profit** (emerald when positive), and **Average X**; values match formulas in `bonus-buy-slots.md` and update when slots change without full page reload.

- **CAP-10**
  - **intent:** An operator adds a slot entry to the active session via the quick-add form.
  - **success:** Required **Slot** and **Purchase ($)** plus optional **Nick / provider** submit to `POST .../slots`; valid row persists; form resets appropriately; stats and list refresh.

- **CAP-11**
  - **intent:** An operator reviews all slots added to the session.
  - **success:** Section title **Bonus list (N)** where N matches slot count; empty state **No bonuses added yet.** when N = 0; populated rows per `bonus-buy-slots.md` when N > 0.

## Constraints

- **Catalog delta:** `bonus-buy` in `MODULE_CATALOG` with status `available` and widget route `/bonus-buy`; do not alter existing module IDs.
- **No toggle:** Bonus Buy card has no `Switch`, no Connected/Disabled labels, and no entry in `caz-modules-{accountId}` localStorage.
- **Card only on `/modules`:** navigation via **Open** only; no inline widget preview.
- **Separate product module:** no coupling to `casino-stream-games` or Spin Prediction.
- **Data model:** `bonus_buy` per `bonus-buy-records.md`; `bonus_buy_slot` per `bonus-buy-slots.md`.
- **API:** account-scoped REST for records and nested slots; session auth and membership check; SQL in `DatabaseService`.
- **Session page UI:** bespoke session header and panel layout per `session-page.md` — not `PageHeader` with `Gift` icon.
- **Visual tokens:** dark shadcn surfaces, amber primary CTAs, emerald positive currency per adopted `design-tokens.md`.
- **English UI:** all labels per `spec-app-english-only`; mockup Russian strings mapped in `session-page.md`.
- **No nav item:** `/bonus-buy` and `/bonus-buy/:id` are not added to sidebar or mobile tab bar.
- **Record CRUD:** create + list only on history page — no edit, delete, or deactivate endpoints unless session-page inline edit is confirmed.

## Non-goals

- Enable/disable toggle or localStorage persistence for Bonus Buy catalog card.
- Sub-section on `/modules` when Bonus Buy is present.
- Enforcing a single active record per account.
- Cross-account admin views or reporting.
- Integration with Spin Prediction or the CasinoStream games library.
- Full OBS browser-source runtime, animated overlay widget, or chat-bot triggers — header buttons may stub until dedicated slices land.
- Slot row edit/delete or bulk import unless added via spec update.
- Edit or deactivate bonus buy records from the history table.

## Success signal

Owner opens `/bonus-buy` → creates session → clicks **Open** → session page shows header, five stat cards, quick-add form, and empty bonus list → adds slot **Gates of Olympus** purchase **$50** → **Spent** shows **$50.00**, list shows **Bonus list (1)** → reload persists slot and stats → `npm run build` in `app/` passes and server e2e covers slot create + list under account scope.

## Assumptions

- Description and icon per `bonus-buy-module.md` (`Gift`, `warning` variant).
- `start_balance` stored and displayed as USD dollars with two decimal places.
- Owner and admin share the same access as `/modules`.
- Session label uses `{title} #{id}` where `id` is `bonus_buy.id`.
- Widget style, OBS link, and Overlay buttons are visible in this slice; full overlay/OBS runtime may follow later.
- Start balance stat card shows edit affordance; PATCH for title/start balance may stub if deferred.
- CAP-2 (toggle enable/disable) retired — superseded by no-toggle decision.

## Open Questions

- What fields each slot needs beyond purchase (e.g. when/how `win_amount` is captured) to compute profit and average X?
- Should **Widget style**, **OBS link**, and **Overlay** be functional in this slice or visible stubs?
- Should inline edit of session title and start balance persist via new PATCH endpoints in this slice?
