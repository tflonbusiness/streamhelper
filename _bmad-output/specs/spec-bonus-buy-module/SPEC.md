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

**Who:** Owner and admin on an active Caz Agent team (English UI, dark MUI theme).

## Capabilities

- **CAP-1**
  - **intent:** An operator sees a **Bonus Buy** module card on `/modules` in the existing responsive grid.
  - **success:** Card renders with name **Bonus Buy**, description from `bonus-buy-module.md`, static **Available** badge, and the same `Card` + `IconTile` header layout as siblings; footer has **Open** only (no toggle); card is last in the grid; no Games-style sub-section on `/modules`.

- **CAP-3**
  - **intent:** An operator opens the Bonus Buy widget from the module card.
  - **success:** Card footer shows **Open** button; click navigates to `/bonus-buy`; button always visible (no enable state).

- **CAP-4**
  - **intent:** An operator reaches the Bonus Buy history page inside the app shell.
  - **success:** `/bonus-buy` renders `PageHeader` (title **Bonus Buy**, `Gift` icon, description per `widget-page.md`), a history card with section header and **New** action, and an `AppTable` per `bonus-buy-records.md`; page uses `AppShell`; direct URL works for any active-account operator.

- **CAP-5**
  - **intent:** An operator creates a bonus buy record for the current account from the history page.
  - **success:** **New** in the history card header opens a MUI `Dialog` with **Title** and **Start balance** (USD, cents) using `inputFieldSx`; valid submit calls `POST /accounts/:accountId/bonus-buys`; row persists with `is_active = true`, `created_by_user_id` from session, and server `created_at`; dialog closes, table refreshes, and `NotificationContext` shows a success toast without full page reload.

- **CAP-6**
  - **intent:** An operator sees the history of bonus buy records for the current account on the history page.
  - **success:** On load, `GET /accounts/:accountId/bonus-buys` populates an `AppTable` with columns title, start balance (`$X.XX`), active/inactive status chips, created by (user name), created date, and **Open** action; rows sorted newest first; **Open** links to `/bonus-buy/:id`; empty, loading, and error states handled; only the session account's records appear.

- **CAP-7**
  - **intent:** An operator opens a bonus buy session and sees the full session workspace for that record.
  - **success:** `/bonus-buy/:id` loads the account-scoped record; layout matches `session-page.md` zones (header bar, stats strip, quick-add panel, bonus list); invalid or foreign id shows error with path back to `/bonus-buy`; loading uses skeletons per companion.

- **CAP-8**
  - **intent:** An operator uses the session header toolbar to navigate, start a new session, and access stream tools.
  - **success:** Back and exit return to `/bonus-buy`; title displays `{title} #{id}` with edit affordance; **+ New session** opens create dialog and navigates to new session on success; **Widget style**, **OBS link**, and **Overlay** render per `session-page.md` and show **Coming soon** toast on click (stubs — no runtime).

- **CAP-9**
  - **intent:** An operator sees live session statistics derived from slot data.
  - **success:** Five stat cards show **Start balance**, **Current balance** (emerald styling), **Spent**, **Profit** (emerald when positive), and **Average X**; values match formulas in `bonus-buy-slots.md` (non-archived slots only; `is_now_playing` does not filter stats) and update when slots change without full page reload.

- **CAP-10**
  - **intent:** An operator adds a slot entry to the active session via the quick-add form.
  - **success:** Required **Slot** and **Purchase ($)** plus optional **Nick / provider** submit to `POST .../slots`; valid row persists with `is_now_playing = false` (DB default), `created_by_user_id` from session, and null `win_amount` / `multiplier`; form resets appropriately; list and stats refresh (**Spent** includes new purchase).

- **CAP-11**
  - **intent:** An operator reviews all slots, edits fields, records wins, and marks which slot is now playing on the widget.
  - **success:** Section title **Bonus list (N)** where N matches slot count; empty state **No bonuses added yet.** when N = 0; populated rows show slot, nick, purchase, win, multiplier, **Now playing** chip when `is_now_playing`, created by, and created date per `bonus-buy-slots.md`; **Edit** dialog PATCHes any mutable field; **Set as playing** / **Clear playing** shortcuts PATCH `is_now_playing` (at most one playing slot per session); stats refresh without full page reload.

- **CAP-13**
  - **intent:** The system records which slot is currently playing so a future stream widget can display it.
  - **success:** `is_now_playing = true` on exactly one slot per session (or zero); setting a slot playing clears siblings atomically; partial unique index enforced; widget runtime out of scope but `GET .../slots` exposes `isNowPlaying` for the playing row.

- **CAP-14**
  - **intent:** An operator removes a slot from the session without erasing history from the database.
  - **success:** **Delete** in row actions opens confirm dialog; confirm calls `DELETE .../slots/:slotId` which archives (`is_archived = true`, `is_now_playing = false`); row hidden from list but retained in DB; stats recalculate; **Bonus list (N)** decrements; success toast; cancel leaves row unchanged; no sibling auto-promoted as now playing.

- **CAP-12**
  - **intent:** An operator sees the Bonus Buy history page using the same shared table, card, chip, and dialog patterns as `/team`.
  - **success:** `BonusBuyPage` uses `AppTable` with column config (no raw `Table` markup); status chips use `toneChipSx` / `mutedChipSx`; history section uses `cardSx` with icon tile header row; create dialog uses `TextField` + `inputFieldSx`; successful create fires a `NotificationContext` toast; visual parity with `TeamPage.tsx` at 1280px without horizontal scroll.

- **CAP-15**
  - **intent:** An operator edits the session title and start balance from the session workspace.
  - **success:** Header pencil opens dialog with **Title**; start balance card pencil opens dialog with **Start balance ($)**; valid PATCH to `/accounts/:accountId/bonus-buys/:id` persists changes; header label `{title} #{id}` and start balance stat update; **Current balance** recalculates; success toast; errors via `StatusAlert` in dialog.

## Constraints

- **Catalog delta:** `bonus-buy` in `MODULE_CATALOG` with status `available` and widget route `/bonus-buy`; do not alter existing module IDs.
- **No toggle:** Bonus Buy card has no `Switch`, no Connected/Disabled labels, and no entry in `caz-modules-{accountId}` localStorage.
- **Card only on `/modules`:** navigation via **Open** only; no inline widget preview.
- **Separate product module:** no coupling to `casino-stream-games` or Spin Prediction.
- **Data model:** `bonus_buy` per `bonus-buy-records.md`; `bonus_buy_slot` per `bonus-buy-slots.md` (FK `bonus_buy_id`, `created_by_user_id`, `is_now_playing`, `is_archived`, stored `multiplier`). Slot table does **not** use `is_active` — that name is reserved for `bonus_buy` sessions.
- **No hard delete:** slot `DELETE` sets `is_archived = true` — never `DELETE FROM bonus_buy_slot`.
- **One playing slot:** at most one `bonus_buy_slot.is_now_playing = true` per `bonus_buy_id`; PATCH clears siblings; partial unique index per `bonus-buy-slots.md`.
- **API:** account-scoped REST for records and nested slots including partial `PATCH` and `DELETE` on slots; session auth and membership check; SQL in `DatabaseService`.
- **History page UI:** `AppTable`, `cardSx`, `inputFieldSx`, `toneChipSx`, `mutedChipSx`, `StatusAlert`, `NotificationContext` — pattern `TeamPage.tsx`; details in `bonus-buy-records.md` and `widget-page.md`.
- **Session page UI:** bespoke session header and panel layout per `session-page.md` — not `PageHeader` with `Gift` icon.
- **Visual tokens:** dark MUI theme from `app/src/theme/colors.ts` — amber primary CTAs, emerald positive currency; session page emerald accents per adopted `design-tokens.md` mapping.
- **English UI:** all labels per `spec-app-english-only`; mockup Russian strings mapped in `session-page.md`.
- **No nav item:** `/bonus-buy` and `/bonus-buy/:id` are not added to sidebar or mobile tab bar.
- **Record CRUD:** create + list on history page; session title and start balance editable via PATCH on `/bonus-buy/:id` only — no delete or deactivate from history table.
- **Row actions on history table:** single **Open** link per row in `AppTable` Actions column — `RowActionsMenu` not required.
- **Slot multiplier:** always `win_amount ÷ purchase_amount` via `decimal.js` on server; not client-supplied.
- **Decimal math:** `decimal.js` for all bonus-buy monetary calculations in `app/` and `server/` — multiplier, stats, aggregations; no native float arithmetic for money.

## Non-goals

- Enable/disable toggle or localStorage persistence for Bonus Buy catalog card.
- Sub-section on `/modules` when Bonus Buy is present.
- Enforcing a single active record per account.
- Cross-account admin views or reporting.
- Integration with Spin Prediction or the CasinoStream games library.
- Full OBS browser-source runtime, animated overlay widget, or chat-bot triggers — header buttons may stub until dedicated slices land.
- Bulk import of slots or manual multiplier override.
- Hard delete or unarchive of archived slots.
- Edit or deactivate bonus buy records from the history table.
- Refactoring `/bonus-buy/:id` session workspace in the history-page component slice.

## Success signal

Owner opens `/bonus-buy` → creates session → **Open** → adds slot **Gates of Olympus** purchase **$50** → **Spent** **$50.00** → **Set as playing** → **Edit** sets win **$600** → multiplier **12.00x** (decimal.js) → **Delete** confirms removal → **Spent** **$0.00**, list empty → reload persists → `npm run build` passes and server e2e covers slot create, PATCH, delete, and one-playing-slot rule.

## Assumptions

- Description and icon per `bonus-buy-module.md` (`Gift`, `warning` variant).
- `start_balance` stored and displayed as USD dollars with two decimal places.
- Owner and admin share the same access as `/modules`.
- Session label uses `{title} #{id}` where `id` is `bonus_buy.id`.
- Widget style, OBS link, and Overlay are visible stubs — **Coming soon** toast only.
- Session title and start balance PATCH ship in the same slice as slots (CAP-15).
- CAP-2 (toggle enable/disable) retired — superseded by no-toggle decision.
- Session page component patterns deferred — CAP-12 applies to `/bonus-buy` history page only.
- Edit, delete, and now-playing UI ship in the same slice as slot schema/API.
- Slot PATCH is partial — any subset of mutable fields; `created_by_user_id` and `created_at` are never writable.
- `is_now_playing` marks the slot on the stream widget; new slots default `false`. Not to be confused with `bonus_buy.is_active`.
- Non-archived slots count toward stats; `is_now_playing` does not filter stats.
- Archived slots (`is_archived = true`) remain in DB for audit; hidden from UI.
- `nick_provider` stores the user-facing nickname field.
- Win pending vs recorded is inferred from `win_amount` nullability — no separate status column.
