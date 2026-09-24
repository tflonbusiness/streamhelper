---
id: SPEC-bonus-buy-module
companions:
  - bonus-buy-module.md
  - bonus-buy-records.md
  - bonus-buy-slots.md
  - bonus-buy-widget.md
  - widget-theme-presets.md
  - session-page.md
  - stream-widget-page.md
  - widget-page.md
  - session-currencies.md
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

**Opportunity:** **Bonus Buy** is a standalone slot bonus-buy engagement module. Operators need a catalog entry, a list/history page, a **session workspace** per record, persistent slot entries with live stats, and **per-session widget style settings** for the stream overlay. Hardcoded overlay colors and dimensions block the **Widget style** workflow.

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
  - **success:** **New** in the history card header opens a MUI `Dialog` with **Name**, **Currency** (searchable catalog per `session-currencies.md`, default USD), and **Start balance** using `inputFieldSx`; valid submit calls `POST /accounts/:accountId/bonus-buys` with `currency_code`; row persists with `status = active`, `created_by_user_id` from session, server `created_at`, and per-session widget bootstrap; dialog closes, table refreshes start balance formatted in chosen currency, and `NotificationContext` shows a success toast without full page reload.

- **CAP-6**
  - **intent:** An operator sees the history of bonus buy records for the current account on the history page.
  - **success:** On load, `GET /accounts/:accountId/bonus-buys` populates an `AppTable` with main columns name, start balance formatted with each row's `currencyCode`, status chips, and **Open** action; expanding a row reveals **Created by** (`createdByName`) and **Created** (locale date-time) in a detail panel; rows sorted newest first; **Open** links to `/bonus-buy/:id`; empty, loading, and error states handled; only the session account's records appear.

- **CAP-7**
  - **intent:** An operator opens a bonus buy session and sees the full session workspace for that record.
  - **success:** `/bonus-buy/:id` loads the account-scoped record; layout matches `session-page.md` zones (header bar, stats strip, quick-add panel, bonus list); invalid or foreign id shows error with path back to `/bonus-buy`; loading uses skeletons per companion.

- **CAP-8**
  - **intent:** An operator uses the session header toolbar to navigate, start a new session, and access stream tools.
  - **success:** Back and exit return to `/bonus-buy`; title displays `{title} #{id}` with edit affordance; **+ New session** opens create dialog and navigates to new session on success; **Widget style** opens style dialog per `bonus-buy-widget.md`; **OBS link** shows **Coming soon** toast; **Overlay** navigates to `/bonus-buy/:id/widget` (no query params).

- **CAP-16**
  - **intent:** A viewer or operator opens the public stream overlay at `/bonus-buy/:id/widget` without signing in.
  - **success:** Route is registered outside `ProtectedRoute` and `AppShell`; page fetches `GET /bonus-buys/:id/widget` without auth; unauthenticated load shows transparent viewport and centered overlay card sized and styled from `settings`; OBS Browser Source works without dashboard session cookie; unknown `:id` shows **Session not found.** on the overlay canvas.

- **CAP-17**
  - **intent:** The overlay displays session summary metrics from live slot data in the Figma compact layout.
  - **success:** Summary row shows **Start balance** (basket icon) and **Average X** (happy icon, `positiveColor` when `> 1x`) computed via `computeSessionStats` from API `slots`; header shows **Bonus Buy #{id}** and non-archived slot count pill; card `width`/`height` and colors from `settings`.

- **CAP-18**
  - **intent:** The overlay shows the now-playing slot and a scrollable list of other session slots for the stream audience.
  - **success:** When `isNowPlaying`: win-highlight row (crown, name, nick, win) if `winAmount` set; LIVE row with `accentColor` left accent, purchase, and **LIVE** badge; when none, both rows omitted; list excludes playing slot and shows remaining non-archived slots with purchase, color-coded win, and multiplier pill per companion; data from public widget API.

- **CAP-19**
  - **intent:** The system persists account-level stream widget style settings shared by all bonus buy sessions.
  - **success:** Table `bonus_buy_widget` has exactly one row per `account_id` with style columns per `bonus-buy-widget.md`; first session create or lazy GET bootstraps Figma `1:5` defaults; authenticated `GET`/`PATCH /accounts/:accountId/bonus-buy-widget` return and update settings; public `GET /bonus-buys/:id/widget` resolves settings via session's account; membership enforced on PATCH.

- **CAP-20**
  - **intent:** An operator customizes account-wide stream overlay appearance from any session workspace.
  - **success:** **Widget style** opens dialog with size, color, shape, and typography fields per `bonus-buy-widget.md`; loads account settings on open; valid **Save** PATCHes `/accounts/:accountId/bonus-buy-widget` and shows success toast; **Preview overlay** opens `/bonus-buy/:id/widget` in a new tab with saved settings; changes apply to all sessions for the account; invalid hex or dimensions show `StatusAlert` errors in dialog.

- **CAP-21**
  - **intent:** An operator previews how the stream widget will look while editing style settings, without saving first.
  - **success:** Widget style dialog shows a live preview panel rendering the shared `WidgetCanvas` with the current session's record and slots; valid `widgetDraft` updates the preview immediately (no API call); when draft fails validation, preview keeps the **last valid** theme snapshot frozen underneath and shows an **error placeholder overlay** with the validation message; preview scales to fit the panel when draft dimensions exceed the container while showing actual px; on narrow viewports a **Preview** control opens a nested dialog with the same live preview and invalid-state behavior; slot or session data changes while the dialog is open refresh the preview; **Save** still persists via PATCH — preview does not write to DB.

- **CAP-22**
  - **intent:** An operator applies a built-in theme preset in the Widget style dialog instead of setting every color manually.
  - **success:** Dialog shows **Theme preset** row with eight named chips (`main`, `classic`, `ruby`, `scarlet`, `purple`, `electric_blue`, `midnight`, `neon`) per `widget-theme-presets.md`, each with `previewDots` swatches; clicking a preset fills `widgetDraft` with that preset's colors and shared size/shape defaults; live preview updates immediately; active chip highlights when draft exactly matches a preset; **Custom** shown when draft diverges; **Save** still PATCHes account settings — preset selection alone does not persist; `main` preset matches `BONUS_BUY_WIDGET_DEFAULTS`.

- **CAP-9**
  - **intent:** An operator sees live session statistics derived from slot data.
  - **success:** Five stat cards show **Start balance**, **Current balance** (emerald styling), **Spent**, **Profit** (emerald when positive), and **Average X**; values match formulas in `bonus-buy-slots.md` (non-archived slots only; `is_now_playing` does not filter stats) and update when slots change without full page reload.

- **CAP-10**
  - **intent:** An operator adds a slot entry to the active session via the quick-add form.
  - **success:** Required **Slot** and **Purchase ($)** plus optional **Nick / provider** submit to `POST .../slots`; valid row persists with `is_now_playing = false` (DB default), `created_by_user_id` from session, and null `win_amount` / `multiplier`; form resets appropriately; list and stats refresh (**Spent** includes new purchase).

- **CAP-11**
  - **intent:** An operator reviews all slots, edits fields, records wins, and marks which slot is now playing on the widget.
  - **success:** Section title **Bonus list (N)** where N matches slot count; empty state **No bonuses added yet.** when N = 0; `AppTable` main columns show slot (with copy + **Now playing** chip), purchase, win, multiplier, and row actions; expanding a row reveals nickname, status, created by, and created date in `SlotExpandedDetails` per `bonus-buy-slots.md`; **Edit** dialog PATCHes any mutable field; **Set as playing** / **Clear playing** shortcuts PATCH `is_now_playing` (at most one playing slot per session); stats refresh without full page reload.

- **CAP-13**
  - **intent:** The system records which slot is currently playing so the stream widget can display it.
  - **success:** `is_now_playing = true` on exactly one slot per session (or zero); setting a slot playing clears siblings atomically; partial unique index enforced; `GET .../slots` exposes `isNowPlaying` for the playing row.

- **CAP-14**
  - **intent:** An operator removes a slot from the session without erasing history from the database.
  - **success:** **Delete** in row actions opens confirm dialog; confirm calls `DELETE .../slots/:slotId` which archives (`is_archived = true`, `is_now_playing = false`); row hidden from list but retained in DB; stats recalculate; **Bonus list (N)** decrements; success toast; cancel leaves row unchanged; no sibling auto-promoted as now playing.

- **CAP-12**
  - **intent:** An operator sees the Bonus Buy history page using the same shared table, card, chip, and dialog patterns as `/team`.
  - **success:** `BonusBuyPage` uses `AppTable` with column config and `expandable` prop (no raw `Table` markup); expandable behavior matches **Bonus list** on `BonusBuySessionPage` (`expandedRecordIds` Set, chevron toggle, `Collapse` detail panel, `RecordExpandedDetails` with same Grid/caption typography as `SlotExpandedDetails`); main columns Title, Start balance, Status, Open only; **Created by** and **Created** in expandable detail; status chips use `toneChipSx` / `mutedChipSx`; history section uses `cardSx` with icon tile header row; create dialog uses `TextField` + `inputFieldSx`; successful create fires a `NotificationContext` toast; main table fits at 1280px without horizontal scroll.

- **CAP-15**
  - **intent:** An operator edits the session name, currency, and start balance from the session workspace.
  - **success:** Header pencil opens dialog with **Name** and **Currency** (same searchable control as create); start balance card pencil opens dialog with **Start balance** and **Currency**; valid PATCH to `/accounts/:accountId/bonus-buys/:id` persists changes; header label `{name} #{id}` and stat cards format amounts with `currencyCode`; **Current balance** recalculates; success toast; errors via `StatusAlert` in dialog.

- **CAP-23**
  - **intent:** An operator chooses which ISO currency applies to a bonus buy session when creating it and can change that currency later.
  - **success:** Create dialog and session edit flows expose a **Currency** field implemented as a searchable dropdown over the full active ISO 4217 catalog per `session-currencies.md`; typing filters by code or name; selection is required on create (default USD); field stays enabled when slots exist; PATCH persists `currency_code` anytime; all bonus-buy monetary UI and the public overlay format amounts with the session's currency via shared `formatBonusBuyMoney`; invalid or unknown codes rejected client- and server-side.

- **CAP-24**
  - **intent:** The stream overlay presents slot title blocks without a placeholder when optional provider text is absent.
  - **success:** On `/bonus-buy/:id/widget`, every row that shows `{name}` + `providerName` (slot list, LIVE playing, win highlight) omits the provider line when `providerName` is null, undefined, or whitespace-only — no em dash (`—`) in that line; the slot name is vertically centered within the same title block; fixed row heights stay unchanged (slot list 74px, LIVE and win highlight 68px per `stream-widget-page.md`); when `providerName` is non-empty after trim, the muted second line renders as today.

## Constraints

- **Catalog delta:** `bonus-buy` in `MODULE_CATALOG` with status `available` and widget route `/bonus-buy`; do not alter existing module IDs.
- **No toggle:** Bonus Buy card has no `Switch`, no Connected/Disabled labels, and no entry in `caz-modules-{accountId}` localStorage.
- **Card only on `/modules`:** navigation via **Open** only; no inline widget preview.
- **Separate product module:** no coupling to `casino-stream-games` or Spin Prediction.
- **Data model:** `bonus_buy` per `bonus-buy-records.md` including `currency_code` per `session-currencies.md`; `bonus_buy_slot` per `bonus-buy-slots.md`; `bonus_buy_widget` per `bonus-buy-widget.md` (per-session FK, preset-backed styles). Slot statuses use `pending` | `playing` | `archived` — not `bonus_buy.status`.
- **Session currency:** ISO 4217 `currency_code` on `bonus_buy`; default **USD** on create; client catalog module; searchable Autocomplete on create and edit; **always editable** (never disabled when slots exist); no FX conversion when currency changes — numeric slot amounts unchanged.
- **Money input:** optional fraction per `session-currencies.md` — whole numbers default, up to 2 dp when typed; `formatBonusBuyMoney` uses `minimumFractionDigits: 0`, `maximumFractionDigits: 2`.
- **Widget bootstrap:** explicit default row insert on account provision and `POST .../bonus-buys`; lazy insert on widget `GET` for legacy accounts (`bonus-buy-widget-defaults.ts`, `ON CONFLICT DO NOTHING`).
- **Widget API path:** `GET/PATCH /accounts/:accountId/bonus-buy-widget` — not nested under session id.
- **Widget colors:** hex `#RRGGBB` or `#RGB` only — no `rgba()` or named colors in DB.
- **Widget dimensions:** width and height each 200–2400 px; defaults 500×600; overlay reads from DB only — no URL `width`/`height`/`w`/`h` query params.
- **Public widget API:** `GET /bonus-buys/:bonusBuyId/widget` returns `{ record, slots, settings }` without auth; replaces `BONUS_BUY_WIDGET_MOCKS`.
- **No hard delete:** slot `DELETE` sets `is_archived = true` — never `DELETE FROM bonus_buy_slot`.
- **One playing slot:** at most one `bonus_buy_slot.is_now_playing = true` per `bonus_buy_id`; PATCH clears siblings; partial unique index per `bonus-buy-slots.md`.
- **API:** account-scoped REST for records, nested slots, and widget settings including partial `PATCH` and `DELETE` on slots; session auth and membership check; SQL in `DatabaseService`.
- **History page UI:** `AppTable` with `expandable` for per-row metadata, `cardSx`, `inputFieldSx`, `toneChipSx`, `mutedChipSx`, `StatusAlert`, `NotificationContext` — pattern `TeamPage.tsx` + session slot expandable detail; details in `bonus-buy-records.md` and `widget-page.md`.
- **History expandable detail:** parity with **Bonus list** `AppTable` on `BonusBuySessionPage` — `useState<Set<number>>`, toggle helper, `expandable` config (`isExpanded`, `onToggle`, `ariaLabel`, `renderDetail`); main columns Title, Start balance, Status, Open only; **Created by** and **Created** in `RecordExpandedDetails` (same component pattern as `SlotExpandedDetails`); rows collapsed by default.
- **Session page UI:** bespoke session header and panel layout per `session-page.md` — not `PageHeader` with `Gift` icon.
- **Visual tokens:** dark MUI theme from `app/src/theme/colors.ts` — amber primary CTAs, emerald positive currency; session page emerald accents per adopted `design-tokens.md` mapping; overlay defaults in `bonus-buy-widget.md`.
- **English UI:** all labels per `spec-app-english-only`; mockup Russian strings mapped in `session-page.md`.
- **No nav item:** `/bonus-buy` and `/bonus-buy/:id` are not added to sidebar or mobile tab bar.
- **Record CRUD:** create + list on history page; session title and start balance editable via PATCH on `/bonus-buy/:id` only — no delete or deactivate from history table.
- **Row actions on history table:** single **Open** link per row in `AppTable` Actions column — `RowActionsMenu` not required.
- **Slot multiplier:** always `win_amount ÷ purchase_amount` via `decimal.js` on server; not client-supplied.
- **Decimal math:** `decimal.js` for all bonus-buy monetary calculations in `app/` and `server/` — multiplier, stats, aggregations; no native float arithmetic for money.
- **Stream overlay route:** `/bonus-buy/:id/widget` is **public** — outside `ProtectedRoute` and `AppShell`; no login redirect; live data via public widget API; authenticated PATCH for settings only.
- **Widget style UI:** dialog on session page per `bonus-buy-widget.md` and `session-page.md` — not a stub; includes theme presets per CAP-22 and live preview per CAP-21.
- **Widget theme presets:** client constants in `app/src/lib/bonus-buy-widget-presets.ts` — eight presets aligned with stream-helper `WIDGET_THEMES`; solid `#RRGGBB` hex only; catalog and color matrix in `widget-theme-presets.md`; no preset column in `bonus_buy_widget` table.
- **Preset apply:** updates `widgetDraft` only — no PATCH until **Save**; `matchBonusBuyWidgetPreset(draft)` for active chip / **Custom** state.
- **Live widget preview:** extract or reuse `WidgetCanvas` from `BonusBuyStreamWidgetPage`; pass `widgetDraft` as theme and session `record` + `slots` as data — no PATCH or public API on field change.
- **Preview layout:** form + preview side-by-side on `md+`; nested preview dialog on smaller breakpoints; scale preview with aspect ratio preserved when draft size exceeds container.
- **Preview invalid state:** maintain `lastValidWidgetDraft` updated only when `validateWidgetDraft` passes; invalid edits render frozen last-valid `WidgetCanvas` plus semi-transparent overlay with validation text — not a blank panel.
- **Overlay design target:** Figma frame `bb` (`1:5`, 500×600) per [stream-widget-page.md](stream-widget-page.md); default colors `#0A0A0C`, `#121215`, `#F59E0B`, `#10B981`, `#EF4444`.
- **Overlay empty provider:** public widget only — do not render `—` for missing `providerName`; center slot name in the title block; row `cellHeight` values unchanged; session workspace expanded details and forms may still use `—` for empty provider.

## Non-goals

- Enable/disable toggle or localStorage persistence for Bonus Buy catalog card.
- Sub-section on `/modules` when Bonus Buy is present.
- Enforcing a single active record per account.
- Cross-account admin views or reporting.
- Integration with Spin Prediction or the CasinoStream games library.
- Large Figma variant `8:23` (1100×1100) or WebSocket/SSE live push on the overlay page.
- Signed OBS token or per-session secret URL — overlay stays public by id until a follow-on hardening slice.
- Chat-bot triggers on the overlay page.
- Bulk import of slots or manual multiplier override.
- Hard delete or unarchive of archived slots.
- Edit or deactivate bonus buy records from the history table.
- Refactoring `/bonus-buy/:id` session workspace in the history-page component slice.
- iframe-based preview of `/bonus-buy/:id/widget` inside the style dialog — use in-process `WidgetCanvas` instead.
- Per-account custom preset save or user-defined preset CRUD — built-in catalog only in this slice.
- Server-side preset list or API — presets are app constants.
- FX conversion or automatic slot amount recalculation when session currency changes.
- Per-currency ISO minor-unit enforcement (e.g. JPY 0 dp catalog rules) — optional 0–2 fraction digits on all money inputs in this slice.
- Cryptocurrency or custom currency codes outside ISO 4217.
- Aligning session workspace **Bonus list** or expanded slot detail with overlay empty-provider rules — overlay widget rows only (CAP-24).

## Success signal

Owner opens `/bonus-buy` → **New** → searches **eur** in **Currency**, selects **EUR — Euro**, start balance **100** → create → history shows **€100** → **Open** → edits currency to **GBP** via session dialog → stats and slot purchase labels show **£** → **Widget style** → **Save** → adds slot purchase **50** → **Set as playing** → **Overlay** shows amounts in GBP → `npm run build` passes.

## Assumptions

- Description and icon per `bonus-buy-module.md` (`Gift`, `warning` variant).
- Create **Currency** defaults to **USD**; existing rows backfill `USD`.
- `start_balance` and slot amounts stored as `NUMERIC(12,2)`; operators may enter whole numbers or up to 2 optional fraction digits — inputs never force `.00`.
- Display currency comes from `currency_code`; changing it updates formatting only — purchase and win values are not converted.
- `currency_code` is always editable (including when slots exist) — no lock in this slice.
- Owner and admin share the same access as `/modules`.
- Session label uses `{title} #{id}` where `id` is `bonus_buy.id`.
- Widget style settings are per **account** — one `bonus_buy_widget` row shared by all sessions.
- Widget style dialog, authenticated settings API, public overlay API, and overlay DB-driven dimensions ship in the same slice.
- OBS link remains **Coming soon** stub; **Overlay** navigates to `/bonus-buy/:id/widget` without query params.
- Stream overlay uses Figma frame `bb` (`1:5`); large variant `8:23` deferred.
- `/bonus-buy/:id/widget` is a public URL — readable by anyone with the link; acceptable for OBS in this slice.
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
- Overlay may poll public widget API on interval; WebSocket deferred.
- Live preview in Widget style dialog uses in-memory `widgetDraft` and session page data — not the public overlay API.
- Invalid draft preview shows both last-valid frozen canvas and error overlay — same validation rules as **Save**.
- Widget theme presets share 500×600 dimensions and Figma shape defaults — only colors vary unless operator edits after apply.
- Preset `live_color` uses each theme's `danger` token except `main` keeps `#FF2222`.
- Preset catalog mirrors stream-helper `WIDGET_THEMES` ids and names — rgba tokens converted to solid hex for DB validation.
