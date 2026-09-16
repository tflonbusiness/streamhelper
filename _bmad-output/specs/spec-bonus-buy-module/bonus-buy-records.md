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
| `GET` | `/accounts/:accountId/bonus-buys/:bonusBuyId` | — | `BonusBuyRecord` |
| `POST` | `/accounts/:accountId/bonus-buys` | `{ title: string; start_balance: string }` | `BonusBuyRecord` |
| `PATCH` | `/accounts/:accountId/bonus-buys/:bonusBuyId` | see below | `BonusBuyRecord` |

**PATCH body** (partial — at least one field):

```ts
{ title?: string; start_balance?: string }
```

| Field | Validation |
|-------|------------|
| `title` | non-empty, max 200 chars |
| `start_balance` | > 0, max 2 decimal places, USD |

**Auth:** session user required; `hasActiveMembership(accountId, userId)`.

**Create:** set `account_id` from route param; `created_by_user_id` from session user; `is_active = true`; `created_at = now()`. Validate `start_balance` is a positive number with at most 2 decimal places.

**PATCH:** verify `bonus_buy.account_id = :accountId`; update only supplied fields; `created_by_user_id` and `created_at` immutable. Changing `start_balance` affects **Current balance** stat (via formulas in `bonus-buy-slots.md`); slot rows unchanged.

**Get one:** `WHERE id = :bonusBuyId AND account_id = :accountId`; 404 if missing or foreign account.

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

`BonusBuyPage` composes shared MUI wrappers from `TeamPage.tsx` — no raw table markup, no page-local badge components.

### Page layout

```
PageHeader (title, description, Gift icon — no action slot)

Card (cardSx)
  Section header row: Gift icon tile + History title + description + New button
  AppTable (history) OR loading skeletons / StatusAlert states
```

### Section header action

| Element | Value |
|---------|-------|
| Button | **New** in card section header (right side) |
| Visible when | `user.accountId` present |
| Opens | MUI `Dialog` with create form |

### Create form (dialog)

| Field | Input | Validation |
|-------|-------|------------|
| Title | `TextField` + `inputFieldSx` | Required, non-empty, max 200 chars |
| Start balance | `TextField` number, `step="0.01"` | Required, > 0, max 2 decimal places |

Label or helper text: USD (dollars and cents). Display formatted as `$1,234.56`.

On success: close dialog, refresh table, `NotificationContext.showSuccess` toast. On error: `StatusAlert` tone error in dialog.

### History table (`AppTable`)

Define columns via `AppTableColumn<BonusBuyRecord>[]`. Use `AppTable` from `@/components/AppTable` with the `expandable` prop.

**Canonical reference:** `BonusBuySessionPage` **Bonus list ({count})** table — copy its expandable mechanics verbatim; only column definitions and `RecordExpandedDetails` fields differ.

| Bonus list (session page) | History table (`/bonus-buy`) |
|---------------------------|------------------------------|
| `expandedSlotIds` + `toggleSlotExpanded` | `expandedRecordIds` + `toggleRecordExpanded` |
| `SlotExpandedDetails` | `RecordExpandedDetails` |
| Main: Slot, Purchase, Win, Multiplier, Actions | Main: Title, Start balance, Status, Open |
| Detail: Nickname, Status, Created by, Created | Detail: Created by, Created |

Shared behavior (from `AppTable` + session page):

- Chevron `IconButton` in leading column; rotates 180° when expanded
- `Collapse` detail row with neutral `bgcolor` and top border (built into `AppTable`)
- `ariaLabel`: `Expand details for {title}` / `Collapse details for {title}`
- Rows collapsed by default; multiple rows may be expanded simultaneously
- No persistence of expanded state across navigation

#### Main columns

| Column | Source | Display |
|--------|--------|---------|
| Title | `title` | Plain text, `fontWeight: 500`, ellipsis on overflow |
| Start balance | `startBalance` | `$X,XXX.XX` (en-US, 2 decimals) |
| Status | `isActive` | `Chip` — **Active** via `toneChipSx(success.light)`; **Inactive** via `mutedChipSx(theme)` |
| Action | — | Icon `Button` as `Link` to `/bonus-buy/:id` (arrow), `aria-label` includes title |

#### Expandable detail (`RecordExpandedDetails`)

Chevron column from `AppTable` `expandable` config. Rows collapsed by default; `expandedRecordIds: Set<number>` tracks open rows.

| Field | Source | Display |
|-------|--------|---------|
| Created by | `createdByName` | `Grid` cell with uppercase caption label **Created by** |
| Created | `createdAt` | `Grid` cell with uppercase caption label **Created**; locale date-time (`en-US`, medium date + short time) |

Layout: copy `SlotExpandedDetails` structure from `BonusBuySessionPage.tsx` — `Grid container spacing={2}`, each field `Grid size={{ xs: 12, sm: 6, md: 3 }}`, caption `Typography variant="caption"` (uppercase, `text.secondary`, `fontWeight: 600`, `letterSpacing: '0.04em'`), value `Typography variant="body2"`. History detail has two fields only (Created by, Created); session slot detail has four (Nickname, Status, Created by, Created).

`expandable` config:

```ts
expandable={{
  isExpanded: (record) => expandedRecordIds.has(record.id),
  onToggle: (record) => toggleRecordExpanded(record.id),
  ariaLabel: (record) =>
    expandedRecordIds.has(record.id)
      ? `Collapse details for ${record.title}`
      : `Expand details for ${record.title}`,
  renderDetail: (record) => <RecordExpandedDetails record={record} />,
}}
```

Empty state when no records: `StatusAlert` tone info — **No bonus buy sessions yet**. Loading: three `Skeleton` rows. Fetch error: `StatusAlert` tone error above table area.

Sort: `created_at` descending (newest first) — server-side on list endpoint.

**Row actions:** single **Open** link per row in the Actions column — not `RowActionsMenu`.

## Out of scope (this companion)

- Widget overlay / OBS runtime tied to a record
- Edit, delete, or toggle `is_active` from UI
- Cross-account queries or admin views
- Session page (`/bonus-buy/:id`) layout — see `session-page.md`
