# Bonus Buy — Bonus list XLSX export

Client-side export of the **Bonus list** panel on `/bonus-buy/:id`. No server endpoint — file is built in the browser from `BonusBuySlot[]` already loaded for the session.

## Trigger

| Element | Placement | Label (English) |
|---------|-----------|-----------------|
| Export button | **Bonus list** card header (right side, with other header actions if present) | **Download XLSX** |

Visible only when `slots.length > 0` (non-archived count matches **Bonus list (N)**). Disabled while a download is in progress if build is async.

Icon: `Download` from `lucide-react` (match Prize Spin History export button pattern).

On success: browser file download starts; optional success toast **Bonus list exported.** On failure: toast or inline error in the Bonus list card.

## Workbook

| Property | Value |
|----------|-------|
| Format | `.xlsx` (OOXML) |
| Sheets | One — **Bonus list** |
| Row order | `created_at ASC` — same as on-screen Bonus list |
| Data scope | **Visible only** — non-archived slots currently shown in Bonus list; archived rows excluded; export mirrors the on-screen list exactly |

## Columns (row 1 = headers)

| Header (English) | Source field | Notes |
|------------------|--------------|-------|
| Slot name | `slot_name` | Plain text |
| Purchase | `purchase_amount` | Numeric cell (session currency unit); not a formatted `$` string |
| Win | `win_amount` | Numeric when set; **empty cell** when null (pending) |
| Multiplier | `multiplier` | Numeric ratio when win set (e.g. `2.5`); **empty cell** when pending — no `x` suffix |
| Username/Note | `nick_provider` | Plain text; empty cell when null |

No slot `id`, status, or created metadata columns in this slice — operators care about the five fields above.

## Filename

```
bonus-buy-{sessionId}-slots-{YYYY-MM-DD}.xlsx
```

- `{sessionId}` — numeric `bonus_buy.id` from route param
- `{YYYY-MM-DD}` — local calendar date at export time

Example: `bonus-buy-42-slots-2026-09-24.xlsx`

## Implementation

| Piece | Location / choice |
|-------|-------------------|
| Library | `xlsx` (SheetJS) — already in `app/package.json` |
| Builder helper | `app/src/lib/bonus-buy-slots-export.ts` — `buildBonusBuySlotsXlsxBlob(slots): Blob` and `downloadBonusBuySlotsXlsx(slots, sessionId): void` |
| Page wiring | `BonusBuySessionPage` Bonus list card header button calls helper with current non-archived `slots` state |

Build flow: map slots → array of row objects → `XLSX.utils.json_to_sheet` → `XLSX.utils.book_new` / `book_append_sheet` → `XLSX.write` with `type: 'array'` → `Blob` → temporary `<a download>` click → revoke object URL.

Parse `purchase_amount`, `win_amount`, and `multiplier` from API strings to numbers for Excel cells using the same decimal rules as the module (`decimal.js` or safe parse) — do not use native float accumulation across rows.

## Empty state

No export button when Bonus list is empty — operator cannot trigger export with zero rows.
