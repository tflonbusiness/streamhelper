---
id: SPEC-prize-spin-session-page
companions:
  - session-page.md
  - prize-spin-sectors.md
  - winners-export.md
  - ../spec-app-english-only/SPEC.md
  - ../spec-caz-agent-ui-improvement/design-tokens.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Caz Agent — Prize Spin session page

## Why

**Pain:** The Prize Spin session route (`/prize-spin/:id`) exists but only shows a placeholder — operators cannot configure wheel sectors, enter a viewer nick, run a spin, or review winners. The module description promises a weighted prize wheel for stream engagement; without a session workspace the feature is unusable during a live stream. Operators also need to share winner records outside the dashboard (reports, fulfillment) without manual copy-paste.

**Who:** Owner or moderator on an active Caz Agent account (English UI, existing MUI dark theme).

## Capabilities

- **CAP-1**
  - **intent:** An operator sees a list of winners for the open prize spin session and can remove individual winner records.
  - **success:** **Winners** panel lists each win with participant nick, prize label, and timestamp; **Remove** archives the row via API and it disappears from the list without a full page reload; empty state shows **No winners yet.**

- **CAP-2**
  - **intent:** An operator manages wheel sectors for the session — add, edit, delete, set win percentage, and choose segment color.
  - **success:** **Wheel sectors** panel lists active sectors with label, win %, and color swatch; **+ Add sector** form creates a row with label, win %, and color; each row has **Edit** (dialog with label, win %, and color picker) and **Delete** (archives sector); total active win % indicator stays ≤ 100 after any change; list updates immediately without full page reload; empty state prompts to add at least two sectors.

- **CAP-3**
  - **intent:** An operator enters a viewer's chat nick on the session page before running a spin.
  - **success:** **Participant nick** field is visible in the **Spin for viewer** panel with placeholder **Viewer chat nick**; value is trimmed and required; field clears after a successful spin.

- **CAP-4**
  - **intent:** An operator executes a weighted spin for the entered participant nick and records the winning sector as a new winner.
  - **success:** **Spin** calls `POST .../spin` with `participant_nick`; server selects a sector by `win_percent` weights among active sectors; response appears at top of **Winners** list with nick, sector label, and time; spin is disabled when nick is empty, fewer than two sectors exist, or a spin request is in flight.

- **CAP-5**
  - **intent:** An operator opens a prize spin session and sees the full session workspace layout for that record.
  - **success:** `/prize-spin/:id` loads account-scoped `prize_spin`; layout matches `session-page.md` (existing header + spin panel + sectors card + winners card); invalid or foreign id shows error with path to `/prize-spin`; loading uses skeletons per companion.

- **CAP-6**
  - **intent:** An operator downloads the current session winner history as an XLSX spreadsheet from the History panel.
  - **success:** **Download XLSX** in the History card header (visible when at least one winner exists) builds a `.xlsx` file client-side from the loaded winner list and triggers a browser download; worksheet columns and filename match `winners-export.md`; exported rows match the on-screen History list order and fields.

## Constraints

- **English UI** copy on all labels, buttons, and empty states per adopted `spec-app-english-only`.
- **Account-scoped auth** on every nested route; verify `prize_spin.account_id = :accountId`.
- **Soft delete only** for winners and sectors — `is_archived = true`; no hard delete.
- **Sector weights** — sum of `win_percent` for active sectors in a session must not exceed 100; at least two active sectors before spin.
- **Sector color** — `#RRGGBB` hex on create and edit; reuse `HexColorField` pattern from Bonus Buy widget style dialog.
- **Streamer-initiated spin** — operator clicks **Spin** in the dashboard; viewers do not trigger spins from chat in this slice.
- **MUI patterns** — reuse `PageHeader`, `Card`, `TextField`, `AppTable`/`Stack`, `StatusAlert`, `inputFieldSx`, `cardSx` consistent with Bonus Buy session page.
- **Brownfield schema** — use existing `prize_spin_sector` and `prize_spin_win` tables; add API and client helpers per `prize-spin-sectors.md`.
- **Client validation** — Yup schemas in `app/src/lib/prize-spin-validation.ts`; sector add/edit and participant nick validate before API calls; rules mirror `prize-spin-sectors.md`.
- **Spin readiness** — disabled **Spin** and `StatusAlert` messages (nick, ≥2 sectors, 100% total) stay inline on the page.
- **Client-side XLSX** — add `xlsx` (SheetJS) to app dependencies; export helper in `app/src/lib/prize-spin-winners-export.ts`; no server export endpoint.
- **Export scope** — XLSX includes only visible (non-archived) wins currently shown in History; archived rows are excluded — export mirrors the on-screen list exactly.

## Non-goals

- Stream overlay widget, OBS browser source, or real-time wheel animation on this page.
- Sector reorder / drag-and-drop (display order follows `sort_order` at insert time only).
- Kick chat integration or viewer-triggered participation.
- Automatic bonus/promo fulfillment to winners.
- Prize Spin history page changes (`/prize-spin` list/create flow already shipped).
- **Ended-session policy** — no special read-only or blocking behavior when `is_active = false`; defer to a follow-on slice.
- CSV or PDF export formats; multi-sheet workbooks with stats; exporting archived/hidden winner rows.

## Success signal

An operator opens a prize spin session, adds three sectors with distinct colors totaling 100% win weight, edits one sector's percentage, deletes another and replaces it, enters a viewer nick, clicks **Spin**, sees the winner in the list with the correct prize label, removes a mistaken entry, and clicks **Download XLSX** to save a spreadsheet whose rows match the History list — all without leaving `/prize-spin/:id` or reloading the page.

## Assumptions

- Default sector colors cycle from a server-side palette when `color` is omitted on create.
- Weighted random selection on the server is sufficient for MVP; no seed display on this page.
- Existing winner rows keep their stored `sector_id` and label snapshot even if the sector is later archived.
- XLSX export uses a single **Winners** worksheet; time column uses the same `formatDateTime` display format as the expanded row detail.
