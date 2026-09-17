---
id: SPEC-prize-spin-history-archive
companions:
  - history-archive.md
  - session-status.md
  - ../spec-prize-spin-session-page/SPEC.md
  - ../spec-prize-spin-stream-widget/SPEC.md
  - ../spec-app-english-only/SPEC.md
  - ../spec-caz-agent-ui-improvement/design-tokens.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Caz Agent — Prize Spin History session archive

## Why

**Pain:** The Prize Spin **History** table on `/prize-spin` lists every session ever created with no way to remove finished or mistaken entries. Operators accumulate stale rows across streams; unlike winners and sectors (which support soft delete), sessions can only be hidden by scrolling. Long account histories become slow to load and hard to scan. Operators need to review archived sessions — open and read sectors, winners, and history — without changing them. Two boolean flags (`is_active`, `is_archived`) allow an invalid combined state and split one lifecycle across columns — a single `status` enum makes transitions explicit.

**Who:** Owner or moderator on an active Caz Agent account (English UI, existing MUI dark theme).

## Capabilities

- **CAP-1**
  - **intent:** An operator archives a prize spin session from the History list on the Prize Spin page.
  - **success:** Each non-archived History row has an **Archive** action; confirmation dialog **Archive session?** explains the session leaves the active list; confirm calls archive API; row disappears when filter is **Active** without full page reload; success toast **Session archived.**

- **CAP-2**
  - **intent:** The History list loads prize spin sessions filtered by archived status, defaulting to active (non-archived) sessions only.
  - **success:** `GET /accounts/:accountId/prize-spins?archived=false` is the default when the param is omitted; `archived=true` returns only archived rows; `archived=all` returns both; list re-fetches when the filter changes; empty states match the selected filter per `history-archive.md`.

- **CAP-3**
  - **intent:** An operator opens an archived session to review its data without modifying it.
  - **success:** `GET /accounts/:accountId/prize-spins/:id` returns the session when `status = 'archived'`; `/prize-spin/:id` loads the workspace in read-only mode with **Archived** indicator; sectors, winners, and spin history remain visible; all mutate actions (go live, deactivate, spin, add/edit/archive sector or winner, widget settings) remain visible but **disabled**; mutating APIs return `404` for archived parent; public overlay still resolves only `status = 'live'`; archiving a live session sets `status = 'archived'` in one step.

- **CAP-4**
  - **intent:** An operator chooses which archived status to show in History using a dropdown above the History table.
  - **success:** MUI **Select** in the `AppTable` toolbar with options **Active**, **Archived**, and **All**; default **Active** (`archived=false`) on page load; changing the selection re-fetches from page 1; filter resets to **Active** on each fresh page visit (not persisted).

- **CAP-5**
  - **intent:** An operator pages through filtered History results when the account has more sessions than one page holds.
  - **success:** List API accepts `page` and `limit`; MUI **TablePagination** below the History table shows total count and prev/next controls; default page 1 and limit 10; changing filter resets to page 1; after archive on the last row of a page, the table shows the previous page or an empty state without error.

## Constraints

- **English UI** copy on dialog, tooltips, toasts, filter labels, and pagination per adopted `spec-app-english-only`.
- **Account-scoped auth** on list and archive endpoints; verify `prize_spin.account_id = :accountId`.
- **Session status enum** — replace `is_active` and `is_archived` with `status TEXT NOT NULL DEFAULT 'off_air' CHECK (status IN ('live', 'off_air', 'archived'))` per `session-status.md`; partial unique index on `(account_id) WHERE status = 'live'`.
- **Soft delete only** — archive sets `status = 'archived'`; no hard delete; child sectors and wins are not cascade-archived.
- **Read-only archived workspace** — GET session, sectors, and wins succeed for `status = 'archived'`; POST/PATCH/DELETE on session, sectors, wins, spin, go-live, and deactivate reject with `404` when parent is archived; UI controls stay visible but **disabled**, not hidden, per `session-status.md`.
- **List archived filter** — optional query param `archived` with values `false` | `true` | `all`; maps to `status != 'archived'`, `status = 'archived'`, and no filter respectively; invalid values → `400`; omit → `false`.
- **List pagination** — optional `page` (1-based, default `1`) and `limit` (default `10`, max `50`); invalid `page` or `limit` → `400`; response shape `{ records, total, page, limit }`; order `created_at DESC` within each page.
- **Archive endpoint** — `DELETE /accounts/:accountId/prize-spins/:prizeSpinId`; sets `status = 'archived'`; `204` on success; `404` when missing, foreign, or already archived.
- **Archive from live** — same transaction sets `status = 'archived'` when current status is `live` or `off_air`; operator does not need a separate deactivate step.
- **Archived row actions** — when `status = 'archived'`, disable **Archive**, **Go live**, and **Deactivate** in History; keep **Open** enabled (read-only workspace per CAP-3).
- **Row visuals** — `status = 'live'`: orange inset border and tint (Bonus Buy now-playing parity); when filter is **All**, `status = 'archived'`: muted title and **Archived** status chip per `history-archive.md`.
- **MUI patterns** — `AppTable` toolbar, **TablePagination**, Archive icon button, and confirmation dialog consistent with `PrizeSpinPage` History card.
- **Filter and page not persisted** — dropdown and pagination reset to **Active** / page `1` on every full page load; no URL param, localStorage, or user preference storage.
- **Fixed page size** — `limit=10` only in UI; no rows-per-page selector in this slice.

## Non-goals

- Unarchive or restore archived sessions.
- Bulk archive (select many or archive all).
- Recording who archived or when (`archived_by_user_id`, `archived_at`, or equivalent audit fields).
- Editing archived session data (sectors, winners, spins, title, widget settings).
- Free-text search or custom sort beyond `created_at DESC`.
- Cursor-based or infinite-scroll pagination.
- User-configurable page size or page-size selector.
- Persisting filter or page in URL, localStorage, or user preferences.
- Bonus Buy History session archive or pagination — explicitly out of scope; Prize Spin only.
- Hard delete or data purge from the database.
- Keeping `is_active` / `is_archived` columns alongside `status`.

## Success signal

An operator opens `/prize-spin` with **Active** on page 1, archives an off-air session — the row vanishes. With 15+ sessions they use pagination to reach older rows. They switch to **Archived**, click **Open** — `/prize-spin/:id` loads with **Archived** banner, sectors and winners visible, spin and edit controls visible but disabled. A live row shows orange border and **Live** chip. Public overlay never serves archived sessions.

## Assumptions

- Archive is one-way from the operator UI; no admin restore path in this slice.
- Public overlay resolves `status = 'live'` only — archived sessions are viewable in dashboard only.
- Ten rows per page is sufficient for stream operators; server max `50` guards abuse only.
- Stream widget and session-page specs adopt `session-status.md` on implement; `live-session-control.md` `is_active` wording is superseded.
- Session status enum finalized as `live` | `off_air` | `archived`; default `off_air`.
