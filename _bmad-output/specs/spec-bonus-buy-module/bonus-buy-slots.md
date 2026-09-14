# Bonus Buy — session slots (data, stats, list)

Slot entries belong to one `bonus_buy` session. Power the quick-add form, bonus list, and stats strip on `/bonus-buy/:id`.

## Database

Table `bonus_buy_slot` in `public` schema. Add via `DatabaseService.initSchema()`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `BIGSERIAL PRIMARY KEY` | |
| `bonus_buy_id` | `BIGINT NOT NULL REFERENCES bonus_buy(id) ON DELETE CASCADE` | Parent session |
| `slot_name` | `TEXT NOT NULL` | Required on create |
| `nick_provider` | `TEXT` | Optional |
| `purchase_amount` | `NUMERIC(12, 2) NOT NULL` | USD; required; > 0 |
| `win_amount` | `NUMERIC(12, 2)` | USD; nullable until result entered |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Server-set |

Index: `(bonus_buy_id, created_at ASC)` for list order.

**Open:** confirm whether `win_amount` is set on create, via row edit, or deferred — required for non-zero profit and average X.

## API

Nested under account-scoped bonus buy routes.

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/accounts/:accountId/bonus-buys/:bonusBuyId/slots` | — | `BonusBuySlot[]` |
| `POST` | `/accounts/:accountId/bonus-buys/:bonusBuyId/slots` | `{ slot_name, nick_provider?, purchase_amount }` | `BonusBuySlot` |

**Auth:** same as bonus buy records — session + membership; verify `bonus_buy.account_id = :accountId`.

**Response shape:**

```ts
interface BonusBuySlot {
  id: number
  bonusBuyId: number
  slotName: string
  nickProvider: string | null
  purchaseAmount: string
  winAmount: string | null
  createdAt: string
}
```

Client module: extend `app/src/api/bonus-buy.ts`.

## Stats formulas

Given session `start_balance` and slot rows:

| Stat | Formula |
|------|---------|
| **Spent** | `Σ purchase_amount` |
| **Profit** | `Σ (win_amount ?? 0) − Σ purchase_amount` |
| **Current balance** | `start_balance − Spent + Σ (win_amount ?? 0)` |
| **Average X** | if `Spent > 0`: `Σ (win_amount ?? 0) / Spent`; else `0` — display as `{value}x` rounded to 1 decimal |

When all `win_amount` are null: profit = `−Spent`, current balance = `start_balance − Spent`, average X = `0x`.

## Bonus list columns (populated)

Minimum columns when list has rows:

| Column | Source |
|--------|--------|
| Slot | `slot_name` |
| Nick / provider | `nick_provider` or em dash |
| Purchase | `$X.XX` from `purchase_amount` |
| Win | `$X.XX` or pending if `win_amount` null |
| Multiplier | `(win_amount / purchase_amount)x` when win present |

Row actions (edit win, delete) — **out of scope** unless user expands slice; quick-add + read-only list for v1 of session page.

## Out of scope (this companion)

- Bulk import of slots
- Reordering slots drag-and-drop
- Slot edit/delete UI (unless added via spec update)
