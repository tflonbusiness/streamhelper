# Prize Spin — sectors and winners (data, API)

Wheel sectors and spin results for a single `prize_spin` session. Powers the sector list, winners list, nick field, and spin action on `/prize-spin/:id`.

Brownfield tables already exist in `DatabaseService.initSchema()`.

## Database

### `prize_spin_sector`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `BIGSERIAL PRIMARY KEY` | |
| `prize_spin_id` | `BIGINT NOT NULL REFERENCES prize_spin(id) ON DELETE CASCADE` | Parent session |
| `label` | `TEXT NOT NULL` | Prize name shown on wheel and in winner list |
| `win_percent` | `NUMERIC(5, 2) NOT NULL` | Weight; `> 0` and `<= 100` |
| `color` | `TEXT` | Hex `#RRGGBB`; server assigns default palette when omitted on create |
| `sort_order` | `INTEGER NOT NULL DEFAULT 0` | Display order; append new sectors at end |
| `is_archived` | `BOOLEAN NOT NULL DEFAULT false` | Soft-delete — excluded from wheel and lists |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Server-set |

**Active sector sum:** sum of `win_percent` for non-archived sectors in a session must not exceed `100` after any create or update. Reject with `400` when the change would push the sum over `100`.

**Minimum wheel:** at least **two** non-archived sectors required before `POST .../spin` is allowed.

**Archive sector:** `DELETE` sets `is_archived = true`. Past `prize_spin_win` rows referencing the sector remain unchanged.

### `prize_spin_win`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `BIGSERIAL PRIMARY KEY` | |
| `prize_spin_id` | `BIGSERIAL NOT NULL REFERENCES prize_spin(id) ON DELETE CASCADE` | Parent session |
| `sector_id` | `BIGSERIAL NOT NULL REFERENCES prize_spin_sector(id)` | Winning sector |
| `participant_nick` | `TEXT NOT NULL` | Viewer nick from dashboard field at spin time |
| `spun_by_user_id` | `BIGSERIAL NOT NULL REFERENCES users(id)` | Operator who clicked spin |
| `is_archived` | `BOOLEAN NOT NULL DEFAULT false` | Soft-delete — hidden from winners list |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Server-set |

**Delete winner:** operator **Remove** sets `is_archived = true`. No hard `DELETE FROM`. Unarchive is out of scope.

List order: `created_at DESC` for winners; `sort_order ASC, id ASC` for sectors.

## API

Nested under account-scoped prize spin routes. Auth: session cookie + account membership; verify `prize_spin.account_id = :accountId`.

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/accounts/:accountId/prize-spins/:prizeSpinId/sectors` | — | `{ sectors: PrizeSpinSector[] }` |
| `POST` | `/accounts/:accountId/prize-spins/:prizeSpinId/sectors` | `{ label, win_percent, color? }` | `PrizeSpinSector` |
| `PATCH` | `/accounts/:accountId/prize-spins/:prizeSpinId/sectors/:sectorId` | partial — see below | `PrizeSpinSector` |
| `DELETE` | `/accounts/:accountId/prize-spins/:prizeSpinId/sectors/:sectorId` | — | `204 No Content` |
| `GET` | `/accounts/:accountId/prize-spins/:prizeSpinId/wins` | — | `{ wins: PrizeSpinWin[] }` |
| `DELETE` | `/accounts/:accountId/prize-spins/:prizeSpinId/wins/:winId` | — | `204 No Content` |
| `POST` | `/accounts/:accountId/prize-spins/:prizeSpinId/spin` | `{ participant_nick }` | `PrizeSpinWin` |

### Types (JSON)

```ts
type PrizeSpinSector = {
  id: number
  prizeSpinId: number
  label: string
  winPercent: string   // e.g. "25.00"
  color: string | null
  sortOrder: number
  createdAt: string
}

type PrizeSpinWin = {
  id: number
  prizeSpinId: number
  sectorId: number
  sectorLabel: string
  participantNick: string
  spunByName: string
  createdAt: string
}
```

### Create sector

| Field | Validation |
|-------|------------|
| `label` | Required; non-empty; max 100 chars |
| `win_percent` | Required; number `> 0` and `<= 100`; max 2 decimal places |
| `color` | Optional; `#RRGGBB` hex (3- or 6-digit accepted on input; store normalized 6-digit uppercase) |

Set `sort_order` to `max(sort_order) + 1` among non-archived sectors. Assign default `color` from a fixed palette cycle when omitted.

### Update sector (PATCH)

At least one field required:

```ts
{
  label?: string
  win_percent?: string | number
  color?: string | null   // null clears to palette default or stored null per server rule
}
```

| Field | Validation |
|-------|------------|
| `label` | non-empty; max 100 chars |
| `win_percent` | `> 0` and `<= 100`; max 2 decimal places; re-check total sum excluding this sector |
| `color` | `#RRGGBB` hex when provided |

`is_archived` is not writable via PATCH — only via `DELETE`.

### Archive sector

`DELETE .../sectors/:sectorId` sets `is_archived = true` when sector belongs to the prize spin and account. `404` when not found or already archived.

### Spin

| Field | Validation |
|-------|------------|
| `participant_nick` | Required; non-empty; max 100 chars; trim whitespace |

**Selection:** weighted random among non-archived sectors using `win_percent` as weights. Use transparent server-side RNG; persist `sector_id`, `participant_nick`, `spun_by_user_id` from session user.

Reject with `400` when fewer than two active sectors or nick empty.

**Response** includes denormalized `sectorLabel` and `spunByName` for list display without extra round-trips.

### Archive winner

`DELETE .../wins/:winId` sets `is_archived = true` when win belongs to the prize spin and account. `404` when not found or already archived.

## Client module

Extend `app/src/api/prize-spin.ts` with:

- `fetchPrizeSpinSectors`, `createPrizeSpinSector`, `updatePrizeSpinSector`, `deletePrizeSpinSector`
- `fetchPrizeSpinWins`, `deletePrizeSpinWin`
- `spinPrizeSpin`

Reuse `HexColorField` on add form and edit dialog.

## Client validation (`app/src/lib/prize-spin-validation.ts`)

Yup schemas; helpers return `string | null` (first error message).

| Validator | When | Rules |
|-----------|------|-------|
| `validatePrizeSpinSectorDraft` | Add/edit sector submit | `label` non-empty, max 100 chars; `win_percent` `> 0` and `<= 100`, max 2 decimal places; `color` `#RRGGBB` hex; `existingTotal` + optional `previousPercent` reject when new total would exceed 100% |
| `validateParticipantNick` | Spin submit | Non-empty after trim; max 100 chars |

Spin panel readiness (disabled **Spin**, `StatusAlert` messages) remains inline in `PrizeSpinSessionPage`.
