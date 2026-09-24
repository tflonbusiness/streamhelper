# Bonus Buy — records (data model, API, UI)

Account-scoped bonus buy sessions. Each record belongs to one account; operators create and review history on `/bonus-buy`.

## Database

Table `bonus_buy` in `public` schema. Add via `DatabaseService.initSchema()`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `BIGSERIAL PRIMARY KEY` | |
| `account_id` | `BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE` | Tenant scope |
| `created_by_user_id` | `BIGINT NOT NULL REFERENCES users(id)` | Session user at insert |
| `name` | `TEXT NOT NULL` | Operator-defined label |
| `start_balance` | `NUMERIC(12, 2) NOT NULL` | Session amount; display per `currency_code` |
| `currency_code` | `CHAR(3) NOT NULL DEFAULT 'USD'` | ISO 4217 — see `session-currencies.md` |
| `status` | `TEXT NOT NULL DEFAULT 'active'` | `active` \| `archived` |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Server-set on insert |

Index: `(account_id, created_at DESC)` for list queries.

**Active records:** no constraint limiting how many rows have `is_active = true` per account.

## API

Account-scoped REST under existing NestJS patterns (`TeamPage` / `accounts.controller.ts` reference).

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/accounts/:accountId/bonus-buys` | — | `BonusBuyRecord[]` |
| `GET` | `/accounts/:accountId/bonus-buys/:bonusBuyId` | — | `BonusBuyRecord` |
| `POST` | `/accounts/:accountId/bonus-buys` | `{ name: string; start_balance: string; currency_code: string }` | `BonusBuyRecord` |
| `PATCH` | `/accounts/:accountId/bonus-buys/:bonusBuyId` | see below | `BonusBuyRecord` |

**PATCH body** (partial — at least one field):

```ts
{ name?: string; start_balance?: string; currency_code?: string }
```

| Field | Validation |
|-------|------------|
| `name` | non-empty, max 200 chars |
| `start_balance` | ≥ 0; whole number or optional fraction, max 2 decimal places |
| `currency_code` | valid ISO 4217 code from catalog — `session-currencies.md` |

**Auth:** session user required; `hasActiveMembership(accountId, userId)`.

**Create:** set `account_id` from route param; `created_by_user_id` from session user; `status = active`; `created_at = now()`; `currency_code` default `USD` if omitted. Validate `start_balance` is ≥ 0 with optional fraction (at most 2 decimal places).

**PATCH:** verify `bonus_buy.account_id = :accountId`; update only supplied fields; `created_by_user_id` and `created_at` immutable. Changing `start_balance` affects **Current balance** stat (via formulas in `bonus-buy-slots.md`); slot rows unchanged.

**Get one:** `WHERE id = :bonusBuyId AND account_id = :accountId`; 404 if missing or foreign account.

**List:** filter `WHERE account_id = :accountId`; join `users` on `created_by_user_id` for `created_by_name`; order `created_at DESC`.

**Response shape:**

```ts
interface BonusBuyRecord {
  id: number
  accountId: number
  name: string
  startBalance: string   // decimal string, e.g. "100.50"
  currencyCode: string   // e.g. "USD"
  status: 'active' | 'archived'
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
| Name | `TextField` + `inputFieldSx` | Required, non-empty, max 200 chars |
| Currency | `Autocomplete` per `session-currencies.md` | Required; default USD; type-to-search |
| Start balance | `TextField` (text + `sanitizeDecimalInput`) | Required, ≥ 0; integer or optional ≤ 2 dp — see `session-currencies.md` |

Display start balance with `formatBonusBuyMoney(startBalance, currencyCode)` — not hardcoded `$`.

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
| Name | `name` | Plain text, `fontWeight: 500`, ellipsis on overflow |
| Start balance | `startBalance` + `currencyCode` | `formatBonusBuyMoney` |
| Status | `status` | `Chip` — **Active** / **Archived** per status enum |
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
