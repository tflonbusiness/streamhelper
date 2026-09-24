# Bonus Buy — session currency

Per-session ISO 4217 currency for formatting monetary amounts in the operator UI and public stream overlay. Amounts are numeric strings — **whole units by default**, optional fraction up to two decimal places when the operator types them. Currency controls **display** only (no FX conversion). Create default: **USD**.

## Database

Add to `bonus_buy`:

| Column | Type | Notes |
|--------|------|-------|
| `currency_code` | `CHAR(3) NOT NULL DEFAULT 'USD'` | Uppercase ISO 4217 alphabetic code |

Migration: backfill existing rows to `USD`.

## Catalog

- Client module `app/src/lib/iso-currencies.ts` (name TBD) exports the full **active** ISO 4217 code list with English display names (e.g. `{ code: 'EUR', name: 'Euro' }`).
- No server endpoint for the list — validate `currency_code` on POST/PATCH against the same code set duplicated or shared in `server/` (single source preferred: copy from generated JSON or shared package if already in monorepo).
- Reject unknown codes with `400` and a clear validation message.

## API

**POST** `/accounts/:accountId/bonus-buys` body adds:

```ts
{ name: string; start_balance: string; currency_code: string }
```

**PATCH** `/accounts/:accountId/bonus-buys/:bonusBuyId` body adds:

```ts
{ currency_code?: string }
```

(can combine with `name` / `start_balance` per existing partial PATCH rules).

**Response** `BonusBuyRecord` adds:

```ts
currencyCode: string   // e.g. "USD"
```

Public widget record shape includes `currencyCode` for overlay formatting.

| Field | Validation |
|-------|------------|
| `currency_code` | exactly 3 uppercase letters; must exist in catalog |

## UI control (create + edit)

Use MUI `Autocomplete` (freeSolo **off**) bound to catalog entries.

| Behavior | Requirement |
|----------|-------------|
| Placement | **Currency** field on `BonusBuyCreateDialog` (with Name, Start balance) and on session edit form (`BonusBuyEditSessionForm` / start-balance edit dialog — same form as name + start balance) |
| Default | `USD` on create |
| Display option | `{code} — {name}` in list; selected value shows code + name |
| Search | Filter options as user types against **code**, **name**, and common **aliases** (e.g. typing `dollar` surfaces USD) |
| Required | Must select a catalog entry before submit |
| Edit lock | **None** — currency stays editable after slots exist; same control on create and session edit |
| Accessibility | Label **Currency**; combobox keyboard navigation per MUI defaults |

Remove hardcoded `($)` / `USD` helper copy from start balance and purchase fields when session currency is known — use neutral **Start balance** / **Purchase** labels; formatted previews use `formatBonusBuyMoney(amount, currencyCode)`.

## Formatting helper

Replace ad-hoc `formatUsd` call sites for bonus-buy surfaces with:

```ts
formatBonusBuyMoney(amount: string | number, currencyCode: string): string
```

`Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode, minimumFractionDigits: 0, maximumFractionDigits: 2 })` — whole amounts render without forced `.00` (e.g. **$100**, not **$100.00**); fractional values show up to 2 dp.

Applies to: history table start balance column, session stat cards, slot table purchase/win, quick-add labels, stream overlay summary and slot rows.

## Money input (all bonus-buy forms)

Shared validation pattern: `^\d+(\.\d{1,2})?$` — integers allowed; optional `.` + 1–2 fraction digits; never require trailing decimals in the field.

| Rule | Detail |
|------|--------|
| Default typing | Operator enters whole numbers (e.g. `50`, `100`) — no auto `.00` on blur |
| Optional cents | User may type `.5` or `.50` — capped at 2 fraction digits |
| Persistence | Server stores `NUMERIC(12,2)`; `"100"` and `"100.50"` both valid |
| Sanitize | Same `sanitizeDecimalInput` behavior — do not pad fraction on submit |

Applies to **Start balance** (create + edit), **Purchase**, **Win** (edit dialog), and any other bonus-buy money `TextField`.

## Out of scope (this companion)

- FX rates or converting existing slot amounts when currency changes
- Per-currency minor-unit rules beyond optional 0–2 fraction digits (e.g. JPY integer-only catalog rules)
- Account-level default currency preference
- Cryptocurrency or custom user-defined currencies
