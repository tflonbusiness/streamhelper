# Prize Spin — live session control (`is_active`)

Account-scoped broadcast flag on `prize_spin.is_active`. The stream overlay URL is fixed per Kick channel slug; the API resolves whichever session is live.

## Semantics

| `is_active` | Meaning |
|-------------|---------|
| `true` | This session is **live** — public overlay serves its sectors and wins |
| `false` | Session is **off air** — not shown on overlay; workspace remains editable |

**Singleton per account:** at most one `prize_spin` row per `account_id` may have `is_active = true`. Enforced in a single DB transaction on go-live.

**Supersedes End session:** remove **End session** / **Ended** chip from the session workspace in this slice. Deactivate is reversible; operators can go live again on the same or another session.

New sessions default `is_active = false` (change from current schema default `true` if needed so new rows do not auto-compete for live slot).

## API — authenticated

Account-scoped; `hasActiveMembership(accountId, userId)`.

| Method | Path | Response |
|--------|------|----------|
| `POST` | `/accounts/:accountId/prize-spins/:prizeSpinId/go-live` | `PrizeSpinRecord` with `isActive: true` |
| `POST` | `/accounts/:accountId/prize-spins/:prizeSpinId/deactivate` | `PrizeSpinRecord` with `isActive: false` |

**Go live transaction:**

1. `UPDATE prize_spin SET is_active = false WHERE account_id = $1 AND is_active = true`
2. `UPDATE prize_spin SET is_active = true WHERE account_id = $1 AND id = $2 RETURNING ...`
3. `COMMIT`

**Deactivate:** set `is_active = false` for the target row only (idempotent if already false).

**Errors:** `404` foreign/missing id; `409` optional if go-live races (prefer transaction isolation).

Remove or repurpose `POST .../end` — deactivate replaces it.

## Session workspace UI (`/prize-spin/:id`)

| State | Header indicator | Primary action |
|-------|------------------|----------------|
| `isActive: true` | **Live** chip — green/success tone, dot or `Radio` icon | **Deactivate** (outlined, error tone) |
| `isActive: false` | none | **Go live** (contained or outlined, success tone) |

- **Go live** → `POST go-live` → toast **Session is now live** → header shows **Live** chip.
- **Deactivate** → confirm dialog (optional, match Bonus Buy end pattern) → `POST deactivate` → toast **Session taken off air**.
- **Overlay** → `/prize-spin/widget/{channelSlug}` in new tab (always; off-air state shown on overlay page).

`channelSlug` from `AuthUser.channelSlug`.

## List page (`/prize-spin`)

Replace **Active** / **Inactive** status chips with **Live** / **Off air** driven by `isActive`.

## Public overlay behavior

| Account state | Overlay at `/prize-spin/widget/:channelSlug` |
|---------------|---------------------------------------------|
| One session `is_active = true` | Normal widget for that session |
| No session `is_active = true` | **No live session.** |
| Unknown slug | **Session not found.** |
| Deactivated while OBS open | Next poll → **No live session.** |
| Switched live session | Next poll → new session's wheel (same URL) |
