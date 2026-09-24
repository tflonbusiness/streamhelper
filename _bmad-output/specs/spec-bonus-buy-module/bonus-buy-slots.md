# Bonus Buy — session slots (data, stats, list)

Slot entries belong to one `bonus_buy` session. Power the quick-add form, bonus list, and stats strip on `/bonus-buy/:id`.

## Database

Table `bonus_buy_slot` in `public` schema. Add via `DatabaseService.initSchema()`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `BIGSERIAL PRIMARY KEY` | |
| `bonus_buy_id` | `BIGINT NOT NULL REFERENCES bonus_buy(id) ON DELETE CASCADE` | Parent session |
| `created_by_user_id` | `BIGINT NOT NULL REFERENCES users(id)` | Session user at insert |
| `slot_name` | `TEXT NOT NULL` | Required on create |
| `nick_provider` | `TEXT` | Optional nickname or provider |
| `purchase_amount` | `NUMERIC(12, 2) NOT NULL` | USD; required; > 0 |
| `win_amount` | `NUMERIC(12, 2)` | USD; nullable until result entered |
| `multiplier` | `NUMERIC(10, 2)` | Nullable; server-derived when `win_amount` set — see below |
| `is_now_playing` | `BOOLEAN NOT NULL DEFAULT false` | Slot shown on stream widget (future) |
| `is_archived` | `BOOLEAN NOT NULL DEFAULT false` | Archived — hidden from list and stats |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Server-set |

**Naming:** `is_now_playing` and `is_archived` are domain-specific slot flags. Do **not** use `is_active` on `bonus_buy_slot` — that name is reserved for `bonus_buy` sessions.

**`is_now_playing`:** marks the slot currently being played on the OBS/stream widget. **Not** used for stats filtering or archival. New slots default `false`. At most **one** non-archived slot per `bonus_buy_id` may have `is_now_playing = true`. Widget runtime reads that row; widget implementation is a follow-on slice.

**`is_archived`:** operator **Delete** sets `is_archived = true` — row stays in DB but is excluded from list, stats, and the playing-slot index. Also sets `is_now_playing = false`. No hard `DELETE FROM`. Unarchive / restore is out of scope.

Partial unique index:

```sql
CREATE UNIQUE INDEX idx_bonus_buy_slot_one_playing
  ON bonus_buy_slot (bonus_buy_id)
  WHERE is_now_playing = true AND is_archived = false;
```

**Win state** (not a column): inferred from `win_amount` — null means pending; set means result recorded.

**Multiplier:** always `win_amount ÷ purchase_amount`, rounded to 2 decimal places. Computed server-side on PATCH when `win_amount` is set; recomputed when `purchase_amount` changes while win remains set; cleared when `win_amount` is null. Never accepted from client.

**Decimal math:** use `decimal.js` for multiplier, stats (Spent, Profit, Current balance, Average X), and all currency aggregation in the bonus-buy module — on both `app/` and `server/`. Do not use native `number` arithmetic for money.

Index: `(bonus_buy_id, created_at ASC) WHERE is_archived = false` for list order (or filter in query).

## API

Nested under account-scoped bonus buy routes.

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/accounts/:accountId/bonus-buys/:bonusBuyId/slots` | — | `BonusBuySlot[]` |
| `POST` | `/accounts/:accountId/bonus-buys/:bonusBuyId/slots` | `{ slot_name, nick_provider?, purchase_amount }` | `BonusBuySlot` |
| `PATCH` | `/accounts/:accountId/bonus-buys/:bonusBuyId/slots/:slotId` | see below | `BonusBuySlot` |
| `DELETE` | `/accounts/:accountId/bonus-buys/:bonusBuyId/slots/:slotId` | — | `204 No Content` |

**PATCH body** (partial update — at least one field required):

```ts
{
  slot_name?: string
  nick_provider?: string | null   // null clears
  purchase_amount?: string
  win_amount?: string | null      // null clears win and multiplier
  is_now_playing?: boolean
}
```

`is_archived` is **not** writable via PATCH — only via `DELETE` (archives the row).

**Auth:** same as bonus buy records — session + membership; verify `bonus_buy.account_id = :accountId`.

**Create:** set `created_by_user_id` from session user; `is_now_playing` and `is_archived` at DB defaults (`false`); `win_amount` and `multiplier` null.

**PATCH rules:**

| Field | Validation | Notes |
|-------|------------|-------|
| `slot_name` | non-empty, max 200 chars | |
| `nick_provider` | optional; `null` clears | |
| `purchase_amount` | > 0; integer or optional ≤ 2 dp | format per session `currency_code` — `session-currencies.md` |
| `win_amount` | ≥ 0; integer or optional ≤ 2 dp; `null` clears | same |
| `is_now_playing` | boolean | `true` = now playing; atomically clears siblings; `false` = not on widget |

Reject PATCH on `is_archived = true` rows (404).

**Immutable on PATCH:** `id`, `bonus_buy_id`, `created_by_user_id`, `created_at`, `multiplier`, `is_archived` (server-set only via DELETE).

**Now playing on PATCH:** when `is_now_playing: true`, run in one transaction: clear `is_now_playing` on non-archived siblings (`WHERE bonus_buy_id = :id AND id != :slotId AND is_archived = false`), then set target `is_now_playing = true`.

**Multiplier on PATCH:** when `win_amount` is non-null after update and `purchase_amount > 0`, recompute `multiplier = win ÷ purchase` via `decimal.js` (2 dp). When `win_amount` cleared to `null`, set `multiplier` to `null`. Recompute also when `purchase_amount` changes while `win_amount` remains set.

Validate slot belongs to `:bonusBuyId` and account; row must have `is_archived = false`.

**Delete (archive):** `UPDATE bonus_buy_slot SET is_archived = true, is_now_playing = false WHERE id = :slotId AND is_archived = false`. No `DELETE FROM`. Response `204 No Content`. Idempotent: second call on same row returns 404.

**List:** `WHERE is_archived = false`; join `users` on `created_by_user_id` for `created_by_name`; order `created_at ASC`.

**Response shape:**

```ts
interface BonusBuySlot {
  id: number
  bonusBuyId: number
  createdByUserId: number
  createdByName: string
  slotName: string
  nickProvider: string | null
  purchaseAmount: string
  winAmount: string | null
  multiplier: string | null   // e.g. "12.50"
  isNowPlaying: boolean
  createdAt: string
}
```

Client module: extend `app/src/api/bonus-buy.ts`.

## Stats formulas

Given session `start_balance` and slot rows where `is_archived = false` (`is_now_playing` does not filter). All sums and divisions via `decimal.js`:

| Stat | Formula |
|------|---------|
| **Spent** | `Σ purchase_amount` |
| **Profit** | `Σ (win_amount ?? 0) − Σ purchase_amount` |
| **Current balance** | `start_balance − Spent + Σ (win_amount ?? 0)` |
| **Average X** | if `Spent > 0`: `Σ (win_amount ?? 0) / Spent`; else `0` — display as `{value}x` rounded to 1 decimal |

When all non-archived rows have null `win_amount`: profit = `−Spent`, current balance = `start_balance − Spent`, average X = `0x`.

Archived rows (`is_archived = true`) contribute neither to Spent nor win sums and do not appear in the list.

## Bonus list columns (populated)

`AppTable` with `expandable` prop on `BonusBuySessionPage`. **Canonical reference** for history table expandable on `/bonus-buy`.

### Main columns

| Column | Source |
|--------|--------|
| Slot | `slot_name` (+ copy button, **Now playing** chip inline when `is_now_playing`) |
| Purchase | `$X.XX` from `purchase_amount` |
| Win | `$X.XX` or **Pending** if `win_amount` null |
| Multiplier | `{multiplier}x` when `win_amount` set; em dash when pending |
| Actions | Set playing, Edit, Delete icon buttons |

### Expandable detail (`SlotExpandedDetails`)

| Field | Source |
|-------|--------|
| Nickname | `nick_provider` or em dash |
| Status | **Now playing** or em dash |
| Created by | `created_by_name` |
| Created | `created_at` locale date-time |

Chevron toggle, `expandedSlotIds` Set, and `Collapse` panel styling come from shared `AppTable` — see `bonus-buy-records.md` history table for the parallel contract.

## Row actions (same slice)

Per-row actions in the bonus list — ship with schema/API, not deferred:

| Action | UI | API |
|--------|-----|-----|
| **Edit** | Opens dialog pre-filled with current row | `PATCH` with changed fields |
| **Set as playing** | Shown when `is_now_playing = false` | `PATCH` `{ is_now_playing: true }` — clears other slots |
| **Clear playing** | Shown when `is_now_playing = true` | `PATCH` `{ is_now_playing: false }` |
| **Delete** | Confirm dialog — title **Delete slot?**, body names `slot_name`; destructive confirm | `DELETE` — archives (`is_archived = true`) |

Row actions: use `RowActionsMenu` when multiple actions per row (same pattern as `TeamPage.tsx`); **Delete** uses `error` color on menu item.

On delete success: close confirm dialog, refresh stats and list, decrement **Bonus list (N)**; `NotificationContext` success toast. Row remains in DB with `is_archived = true`.

## XLSX export

Client-side **Download XLSX** from the Bonus list panel — columns, filename, and scope per `bonus-buy-slots-export.md`. Wired on `BonusBuySessionPage`; no API change.

**Edit dialog fields:**

| Field | Required | Notes |
|-------|----------|-------|
| Slot | yes | `slot_name` |
| Nick / provider | no | `nick_provider`; empty clears |
| Purchase | yes | `purchase_amount` — money input rules per `session-currencies.md` |
| Win ($) | no | `win_amount`; empty clears win and multiplier |
| Now playing | toggle | `is_now_playing`; turning on clears siblings server-side |

Use `TextField` + `inputFieldSx` per create dialog. On success: close dialog, refresh stats and list; `NotificationContext` success toast.

## Widget contract

OBS overlay at `/bonus-buy/:id/widget` per `stream-widget-page.md`. Displays non-archived slots; `is_now_playing` drives LIVE + win-highlight rows; list excludes playing slot. Mock data in overlay slice; live API deferred.

## Out of scope (this companion)

- Bulk import of slots
- Reordering slots drag-and-drop
- Manual multiplier override (always `win ÷ purchase` via `decimal.js`)
- Hard delete (`DELETE FROM`) of slot rows
- Unarchive / restore archived slots
- OBS widget runtime that consumes `is_now_playing` (data contract only in this slice)
