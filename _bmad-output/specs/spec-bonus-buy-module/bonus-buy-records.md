# Bonus Buy — records (data model, API, UI)

Account-scoped bonus buy sessions. Each record belongs to one account; operators create and review history on `/bonus-buy`.

## Database

Table `bonus_buy` in `public` schema. Add via `DatabaseService.initSchema()`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `BIGSERIAL PRIMARY KEY` | |
| `account_id` | `BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE` | Tenant scope |
| `created_by_user_id` | `BIGINT NOT NULL REFERENCES users(id)` | Session user at insert |
| `title` | `TEXT NOT NULL` | Operator-defined label |
| `start_balance` | `NUMERIC(12, 2) NOT NULL` | USD dollars with cents |
| `is_active` | `BOOLEAN NOT NULL DEFAULT true` | Multiple active rows allowed per account |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Server-set on insert |

Index: `(account_id, created_at DESC)` for list queries.

**Active records:** no constraint limiting how many rows have `is_active = true` per account.

## API

Account-scoped REST under existing NestJS patterns (`TeamPage` / `accounts.controller.ts` reference).

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/accounts/:accountId/bonus-buys` | — | `BonusBuyRecord[]` |
| `POST` | `/accounts/:accountId/bonus-buys` | `{ title: string; start_balance: string }` | `BonusBuyRecord` |

**Auth:** session user required; `hasActiveMembership(accountId, userId)`.

**Create:** set `account_id` from route param; `created_by_user_id` from session user; `is_active = true`; `created_at = now()`. Validate `start_balance` is a positive number with at most 2 decimal places.

**List:** filter `WHERE account_id = :accountId`; join `users` on `created_by_user_id` for `created_by_name`; order `created_at DESC`.

**Response shape:**

```ts
interface BonusBuyRecord {
  id: number
  accountId: number
  title: string
  startBalance: string   // decimal string, e.g. "100.50"
  isActive: boolean
  createdAt: string      // ISO 8601
  createdByUserId: number
  createdByName: string  // users.name
}
```

Client API module: `app/src/api/bonus-buy.ts`.

## Widget page UI

Replace empty main on `BonusBuyPage` with create + history (pattern: `TeamPage.tsx`).

### Header action

| Element | Value |
|---------|-------|
| Button | **New bonus buy** in `PageHeader` action slot |
| Opens | `Dialog` with create form |

### Create form (dialog)

| Field | Input | Validation |
|-------|-------|------------|
| Title | `Input` text | Required, non-empty |
| Start balance | `Input` number, `step="0.01"` | Required, > 0, max 2 decimal places |

Label or helper text: USD (dollars and cents). Display formatted as `$1,234.56`.

On success: close dialog, refresh table. On error: inline alert in dialog.

### History table

| Column | Source | Display |
|--------|--------|---------|
| Title | `title` | Plain text |
| Start balance | `startBalance` | `$X,XXX.XX` (en-US, 2 decimals) |
| Status | `isActive` | Badge: **Active** / **Inactive** |
| Created by | `createdByName` | `users.name` of creator |
| Created | `createdAt` | Locale date-time |

Empty state when no records. Loading: `Skeleton` rows. Error: `Alert` above table.

Sort: `created_at` descending (newest first).

### Row action

| Column | Action |
|--------|--------|
| Action | **Open** button → `Link` to `/bonus-buy/:id` (session workspace per `session-page.md`) |

## Out of scope (this companion)

- Widget overlay / OBS runtime tied to a record
- Edit, delete, or toggle `is_active` from UI
- Cross-account queries or admin views
