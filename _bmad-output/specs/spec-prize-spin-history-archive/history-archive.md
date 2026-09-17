# Prize Spin History — session archive

## Schema

On `prize_spin` (see `session-status.md` for full status model):

| Column | Type | Notes |
|--------|------|-------|
| `status` | `TEXT NOT NULL DEFAULT 'off_air'` | `CHECK (status IN ('live', 'off_air', 'archived'))` — replaces `is_active` and `is_archived` |

Partial unique index: `(account_id) WHERE status = 'live'`.

Partial list index: `(account_id, created_at DESC) WHERE status != 'archived'`.

DDL in `database.service.ts` bootstrap alongside existing table definitions.

## API

### List (paginated)

`GET /accounts/:accountId/prize-spins`

| Param | Values | Default | Notes |
|-------|--------|---------|-------|
| `archived` | `false` \| `true` \| `all` | `false` | Maps to status filter per `session-status.md` |
| `page` | integer ≥ 1 | `1` | 1-based page index |
| `limit` | integer 1–50 | `10` | Page size |

**Response:**

```json
{
  "records": [ /* PrizeSpinRecord[] */ ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

Each record includes `status`: `'live' | 'off_air' | 'archived'`. Ordered `created_at DESC`. Invalid `archived`, `page`, or `limit` → `400`.

**Database:** `COUNT(*)` with same status filter; `LIMIT` / `OFFSET (page - 1) * limit` on list query.

### Archive

| Method | Route | Behavior |
|--------|-------|----------|
| `DELETE` | `/accounts/:accountId/prize-spins/:prizeSpinId` | Sets `status = 'archived'`. Works from `live` or `off_air`. Returns `204`. `404` when id not found, wrong account, or already `archived`. |

**Get session / sectors / wins:** allowed for `status = 'archived'` (read-only review).

**Mutations** (go live, deactivate, spin, sector/win CRUD, title edit, widget settings): `404` when parent `status = 'archived'`.

**Client helpers** (`app/src/api/prize-spin.ts`):

- `fetchPrizeSpins(accountId, { archived?, page?, limit? })` → `{ records, total, page, limit }`
- `archivePrizeSpin(accountId, prizeSpinId)` — `DELETE`

**Server types:** `DbPrizeSpin.status`.

## UI (`PrizeSpinPage` History card)

### AppTable toolbar — archived filter

MUI `Select` in `AppTable` `toolbar` prop (inside table container, above column headers).

| Option | Query param | Label |
|--------|-------------|-------|
| Default | `archived=false` | **Active** |
| Archived only | `archived=true` | **Archived** |
| Both | `archived=all` | **All** |

- `size="small"`, `inputFieldSx`, min width ~140px
- Label **Show**
- On change: reset `page` to `1`, re-fetch
- Default on mount: **Active**; not persisted across page loads

### Pagination

MUI `TablePagination` directly below `AppTable` (outside table container, aligned right).

- `rowsPerPage={10}` fixed — hide rows-per-page selector (`rowsPerPageOptions={[]}` or single option)
- `page` state 0-based in component, API uses 1-based
- `count={total}` from API
- On page change: re-fetch with new `page`
- On filter change: reset to page `1`
- Not persisted across full page reloads

**After archive success:** re-fetch current page; if `records.length === 0` and `total > 0`, request `page - 1` (min `1`).

### Row visuals

| Condition | Treatment |
|-----------|-----------|
| `status = 'live'` | Orange inset `box-shadow` + light warning tint on row (Bonus Buy `playingSlotRowSx` parity) |
| `status = 'archived'` when filter is **All** | Muted title (`text.secondary`); **Archived** chip in Status column |
| `status = 'off_air'` | Default table styling |

Expanded row keeps **Created by** / **Created** only.

### Row actions

| `status` | Actions |
|----------|---------|
| `live` | Deactivate, Archive, Open |
| `off_air` | Go live, Archive, Open |
| `archived` | Open enabled; Go live, Archive, Deactivate visible, disabled |

### Empty states

| Filter | Message |
|--------|---------|
| Active | **No prize spin sessions yet** |
| Archived | **No archived sessions** |
| All | **No prize spin sessions yet** |

### Confirmation dialog

- Title: **Archive session?**
- Body: session removed from active list; archived session can be opened for review but not edited
- **Archive** button `color="error"`

## Read-only session workspace (`/prize-spin/:id`)

When `status = 'archived'`, all interactive controls remain **visible but disabled** (`disabled` prop / equivalent — not `display: none` or conditional unmount):

| Area | Behavior |
|------|----------|
| Header | **Archived** chip (muted); Go live / Deactivate visible, disabled |
| Wheel / sectors | Visible; add, edit, delete, reorder controls visible, disabled |
| Spin | Visible, disabled |
| Winners | Visible; remove / archive actions visible, disabled |
| Title edit | Visible, disabled |
| Widget settings link | Visible, disabled |

Optional subtle banner: **This session is archived. View only.**

## Out of scope (this companion)

- Unarchive / restore
- Bulk archive
- Archive audit (who / when)
- Editing archived data
- Cursor / infinite-scroll pagination
- Configurable page size in UI
- Filter or page persistence
- Bonus Buy History
