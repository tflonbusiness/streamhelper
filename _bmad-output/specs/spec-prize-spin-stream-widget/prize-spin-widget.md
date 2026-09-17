# Prize Spin — widget settings (`prize_spin_widget`)

Account-level size configuration for stream overlays at `/prize-spin/:id/widget`. **One row per account** — shared across every prize spin session. Sector colors come from `prize_spin_sector.color`; this table controls overlay canvas size only.

## Database

Table `prize_spin_widget` exists in `public` schema (brownfield). Columns today:

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | `BIGSERIAL PRIMARY KEY` | | |
| `account_id` | `BIGINT NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE` | | One row per account |
| `width` | `INTEGER NOT NULL` | `500` | Wheel/card width px |
| `height` | `INTEGER NOT NULL` | `500` | Wheel/card height px |
| `created_at` | `TIMESTAMPTZ NOT NULL` | `now()` | Server-set on insert |
| `updated_at` | `TIMESTAMPTZ NOT NULL` | `now()` | Server-set on PATCH |

**Dimension validation:** `width` and `height` each ≥ 200 and ≤ 2400.

**Bootstrap:** explicit insert from `server/src/prize-spin/prize-spin-widget-defaults.ts` (`ON CONFLICT (account_id) DO NOTHING`):

1. **Account provision** — same transaction as `INSERT INTO accounts` in `provisionOwnerFromKick`.
2. **First prize spin** — same transaction as `POST .../prize-spins`.
3. **Lazy fallback** — `GET /accounts/:accountId/prize-spin-widget` or public overlay read if row missing (legacy accounts).

No theme/color columns in this slice — defer full palette to a follow-on.

## API — authenticated

Account-scoped REST; `hasActiveMembership(accountId, userId)`.

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/accounts/:accountId/prize-spin-widget` | — | `PrizeSpinWidgetSettings` |
| `PATCH` | `/accounts/:accountId/prize-spin-widget` | partial fields below | `PrizeSpinWidgetSettings` |

**PATCH body** (partial — at least one field):

```ts
{
  width?: number
  height?: number
}
```

**Response shape:**

```ts
interface PrizeSpinWidgetSettings {
  id: number
  accountId: number
  width: number
  height: number
  createdAt: string
  updatedAt: string
}
```

## API — public overlay

| Method | Path | Auth | Response |
|--------|------|------|----------|
| `GET` | `/prize-spins/:prizeSpinId/widget` | none | `PrizeSpinWidgetView` |

**Response shape:**

```ts
interface PrizeSpinWidgetView {
  record: {
    id: number
    title: string
    isActive: boolean
  }
  sectors: Array<{
    id: number
    label: string
    winPercent: string
    color: string | null
    sortOrder: number
  }>
  latestWin: {
    id: number
    sectorId: number
    sectorLabel: string
    participantNick: string
    createdAt: string
  } | null
  settings: {
    width: number
    height: number
  }
}
```

- `sectors`: non-archived only; order by `sort_order ASC`.
- `latestWin`: newest non-archived `prize_spin_win` for the session (`created_at DESC`); `null` when no wins.
- `settings`: resolved via session's `account_id` (`ensureAccountPrizeSpinWidget`).

**404:** unknown `prizeSpinId` → `NotFoundException` (client shows **Session not found.**).

Register controller at `server/src/prize-spin/prize-spin.controller.ts` with `@Controller('prize-spins')` — mirror `bonus-buy.controller.ts`.

## Session workspace — Widget size dialog

On `/prize-spin/:id` session header actions (alongside **Overlay**):

| Control | Label (English) | Behavior |
|---------|-----------------|----------|
| Widget size | **Widget size** | Opens MUI `Dialog` with **Width** and **Height** number fields (px) |
| Save | **Save** | `PATCH /accounts/:accountId/prize-spin-widget`; success toast |
| Cancel | **Cancel** | Close without save |

Load settings on dialog open. Validate 200–2400 per field; `StatusAlert` on error. No live preview in this slice — operator uses **Overlay** to verify.

**OBS link:** **Coming soon** toast stub (match Bonus Buy session page).
