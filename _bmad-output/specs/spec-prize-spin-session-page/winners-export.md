# Prize Spin — winners XLSX export

Client-side export of the **History** panel winner list on `/prize-spin/:id`. No server endpoint — file is built in the browser from `PrizeSpinWin[]` already loaded for the session.

## Trigger

| Element | Placement | Label (English) |
|---------|-----------|-----------------|
| Export button | **History** card header, left of **Archive all** | **Download XLSX** |

Visible only when `wins.length > 0`. Disabled while a download is in progress (if async build is needed).

Icon: `Download` from `lucide-react` (match existing header button pattern).

On success: browser file download starts; optional success toast **Winners exported.** On failure: `StatusAlert` inline in History card or toast error.

## Workbook

| Property | Value |
|----------|-------|
| Format | `.xlsx` (OOXML) |
| Sheets | One — **Winners** |
| Row order | Newest first (`created_at DESC`) — same as History table |
| Data scope | **Visible only** — non-archived wins currently shown in History; archived rows excluded; export mirrors the on-screen list exactly |

## Columns (row 1 = headers)

| Header (English) | Source field | Notes |
|------------------|--------------|-------|
| Participant nick | `win.participantNick` | Plain text |
| Prize | `win.sectorLabel` | Snapshot label at spin time |
| Spun by | `win.spunByName` | Operator display name |
| Time | `win.createdAt` | Formatted with same `formatDateTime` helper as expanded row detail |

No win `id` column in MVP — operators care about nick, prize, and time.

## Filename

```
prize-spin-{sessionId}-winners-{YYYY-MM-DD}.xlsx
```

- `{sessionId}` — numeric `prize_spin.id` from route param
- `{YYYY-MM-DD}` — local calendar date at export time

Example: `prize-spin-42-winners-2026-09-17.xlsx`

## Implementation

| Piece | Location / choice |
|-------|-------------------|
| Library | `xlsx` (SheetJS) — add to `app/package.json` |
| Builder helper | `app/src/lib/prize-spin-winners-export.ts` — `buildWinnersXlsxBlob(wins): Blob` and `downloadWinnersXlsx(wins, sessionId): void` |
| Page wiring | `PrizeSpinSessionPage` History card header button calls helper with current `wins` state |

Build flow: map wins → array of row objects → `XLSX.utils.json_to_sheet` → `XLSX.utils.book_new` / `book_append_sheet` → `XLSX.write` with `type: 'array'` → `Blob` → temporary `<a download>` click → revoke object URL.

## Empty state

No export button when History is empty — operator cannot trigger export with zero rows.
