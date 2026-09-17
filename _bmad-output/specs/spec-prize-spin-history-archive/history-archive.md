# Prize Spin History — session archive

## Schema

Add to `prize_spin`:

| Column | Type | Notes |
|--------|------|-------|
| `is_archived` | `BOOLEAN NOT NULL DEFAULT false` | Soft delete; same pattern as `prize_spin_sector` and `prize_spin_win` |

Index: partial on `(account_id, created_at DESC) WHERE is_archived = false` — replace or supplement `idx_prize_spin_account_created` for active-only list queries.

Migration runs in `database.service.ts` bootstrap alongside existing table DDL.

## API

### List (paginated)

`GET /accounts/:accountId/prize-spins`

| Param | Values | Default | Notes |
|-------|--------|---------|-------|
| `archived` | `false` \| `true` \| `all` | `false` | Filter by archive status |
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

Each record includes `isArchived: boolean`. Ordered `created_at DESC`. Invalid `archived`, `page`, or `limit` → `400`.

**Database:** `COUNT(*)` with same `archived` filter; `LIMIT` / `OFFSET (page - 1) * limit` on list query.

### Archive

| Method | Route | Behavior |
|--------|-------|----------|
| `DELETE` | `/accounts/:accountId/prize-spins/:prizeSpinId` | Archive session. Sets `is_archived = true`. If `is_active = true`, also sets `is_active = false`. Returns `204`. `404` when id not found, wrong account, or already archived. |

**Get filter:** `getPrizeSpinById` requires `is_archived = false`.

**Go live:** rejects archived rows (`404`).

**Client helpers** (`app/src/api/prize-spin.ts`):

- `fetchPrizeSpins(accountId, { archived?, page?, limit? })` → `{ records, total, page, limit }`
- `archivePrizeSpin(accountId, prizeSpinId)` — `DELETE`

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
| `isActive && !isArchived` | Orange inset `box-shadow` + light warning tint on row (Bonus Buy `playingSlotRowSx` parity) |
| `isArchived` when filter is **All** | Muted title (`text.secondary`); **Archived** chip in Status column |
| Other rows | Default table styling |

### Row actions (non-archived)

**Archive** — red outlined icon after Go live/Deactivate, before Open.

### Row actions (archived)

Hide **Archive**, **Go live**, **Deactivate**; keep **Open**.

### Empty states

| Filter | Message |
|--------|---------|
| Active | **No prize spin sessions yet** |
| Archived | **No archived sessions** |
| All | **No prize spin sessions yet** |

### Confirmation dialog

- Title: **Archive session?**
- Body: session removed from active list; archived data stays in DB but session page is inaccessible
- **Archive** button `color="error"`

## Out of scope (this companion)

- Unarchive / restore
- Bulk archive
- Cursor / infinite-scroll pagination
- Configurable page size in UI
- Filter or page persistence
- Bonus Buy History
