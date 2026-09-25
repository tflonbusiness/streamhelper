# Prize Spin — widget settings (`prize_spin_widget`)

Account-level size configuration for stream overlays at `/modules/prize-spin/:prizeSpinId/widget`. **One row per account** — shared across every prize spin session. Sector colors come from `prize_spin_sector.color`; this table controls overlay canvas size only.

Public overlay serves sessions with `prize_spin.status = 'active'` — see [../spec-prize-spin-history-archive/session-status.md](../spec-prize-spin-history-archive/session-status.md).

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

**Live flag** on `prize_spin` (not `prize_spin_widget`):

| Column | Semantics |
|--------|-----------|
| `is_active` | `true` = live on stream overlay; at most one per `account_id` |

Consider changing insert default to `false` so new sessions do not auto-go-live.

## API — authenticated

Account-scoped REST; `hasActiveMembership(accountId, userId)`.

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/accounts/:accountId/prize-spin-widget` | — | `PrizeSpinWidgetSettings` |
| `PATCH` | `/accounts/:accountId/prize-spin-widget` | partial fields below | `PrizeSpinWidgetSettings` |
| `POST` | `/accounts/:accountId/prize-spins/:prizeSpinId/go-live` | — | `PrizeSpinRecord` |
| `POST` | `/accounts/:accountId/prize-spins/:prizeSpinId/deactivate` | — | `PrizeSpinRecord` |

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

Remove `POST .../prize-spins/:id/end` — replaced by deactivate.

## API — public overlay

| Method | Path | Auth | Response |
|--------|------|------|----------|
| `GET` | `/prize-spins/:prizeSpinId/widget` | none | `PrizeSpinWidgetView` |

**Removed:** `GET /prize-spins/widget/:ucid`, `/modules/prize-spin/widget/:ucid`, channel-slug resolution.

**Resolution:**

1. Load `prize_spin` by `:prizeSpinId`. Missing → `404`.
2. If `is_active = false` → `409` with `{ message: 'NOT_LIVE' }`.
3. Join sectors, latest win, and `prize_spin_widget` settings for the session's `account_id`.

**Response shape:**

```ts
interface PrizeSpinWidgetView {
  record: {
    id: number
    title: string
    isActive: boolean  // always true when returned
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
- `settings`: resolved via `account_id` (`ensureAccountPrizeSpinWidget`).

**Client error mapping:**

| HTTP | Overlay copy |
|------|----------------|
| `404` | **Session not found.** |
| `409` / `NOT_LIVE` | **No live session.** |

Register public handler at `server/src/prize-spin/prize-spin.controller.ts` — e.g. `@Get(':prizeSpinId/widget')` on `prize-spins` controller (replace `widget/:ucid`).

## Session workspace — Stream Widget card

On `/modules/prize-spin/:id` only — **not** on `/modules/prize-spin` history page.

Card pattern: reuse `PrizeSpinStreamWidgetSection` (or session-scoped variant) below the session header card.

| Control | Label (English) | Behavior |
|---------|-----------------|----------|
| Section title | **Stream Widget** | Monitor icon; description mentions OBS overlay |
| Widget settings | **Widget settings** | Opens MUI `Dialog` with **Width** and **Height** (px) |
| Open overlay | **Open overlay** | New tab → `/modules/prize-spin/{id}/widget` |
| OBS link | **OBS link** | Copy full URL with `window.location.origin` |
| Save (dialog) | **Save** | `PATCH /accounts/:accountId/prize-spin-widget`; success toast |
| Cancel (dialog) | **Cancel** | Close without save |

Load settings on dialog open. Validate 200–2400 per field; `StatusAlert` on error. No live preview in this slice — operator uses **Open overlay** to verify.

**History page:** remove `PrizeSpinStreamWidgetSection` from `PrizeSpinPage` — widget configuration is session-scoped in navigation only.
