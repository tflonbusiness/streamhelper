# Prize Spin — session page (`/prize-spin/:id`)

Operator workspace for a single prize spin session. Extends the existing `PrizeSpinSessionPage` stub — replaces the placeholder info alert with sector management, nick input, spin control, and winners history.

## Route

| Path | Component | Guards |
|------|-----------|--------|
| `/prize-spin/:id` | `PrizeSpinSessionPage` | `ProtectedRoute` → `AppShell` → `AccountActiveRoute` |

Load `prize_spin` by `:id` for the session account. Invalid id or foreign account → error state with link to `/prize-spin`.

## Layout (top → bottom)

Vertical `Stack spacing={4}` inside `AppShell` main. Reuse existing session header card (title, `#id`, **Ended** chip, **End session** when active). Below it:

```
SpinPanelCard          ← nick field + spin action
SectorsCard            ← sector list + add form
WinnersCard            ← winners list with remove
```

### Responsive

- **Desktop:** spin panel = nick field and **Spin** button on one row (field grows, button right-aligned).
- **Mobile:** nick field full width; **Spin** button full width below.

## 1. Spin panel

Panel title: **Spin for viewer**

| Element | Behavior | Label (English) |
|---------|----------|-----------------|
| Nick field | `TextField`; required before spin | **Participant nick** |
| Spin button | Primary; calls `POST .../spin` | **Spin** |

Placeholder on nick field: **Viewer chat nick**

**Spin disabled when:** nick empty/whitespace, fewer than two sectors, or request in flight.

On success: append winner to **Winners** list, clear nick field, show success toast. On error: `StatusAlert` inline in panel.

## 2. Sectors card

Panel title: **Wheel sectors ({count})** — count = non-archived sectors.

Section description (English): **Labels, colors, and win weights — total must equal 100%**

**Percent allocation:** Each active sector carries a `win_percent` weight. The operator fills weights until the **sum of all active sectors equals 100%** — not a partial wheel. Show a running total **Total: {sum}% / 100%** (update after add, edit, delete). When the sum is below 100%, the gap is unallocated weight; when above 100%, add/edit is rejected (client and server). **Spin** stays disabled until **Total** reads **100% / 100%** (two-decimal equality).

Header action **Split 100%** (outlined, beside **Add sector**): when at least one sector exists, redistribute active sectors evenly so their weights sum to exactly 100%; disabled while request pending or in read-only mode.

### Add sector (dialog — match Bonus Buy add pattern)

| Field | Required | Control | Placeholder (English) |
|-------|----------|---------|----------------------|
| Label | yes | `TextField` | Prize label |
| Win % | yes | `TextField` `type="number"`; min 0.01; max 100; step 0.01 | Win chance (%) |
| Color | no | `HexColorField` (reuse from `app/src/components/bonus-buy/HexColorField.tsx`) | — |

Submit: primary button in dialog header flow **Add sector** (opens dialog from section header).

Validation: inline on submit; disable while saving. Reject when `existingTotal + new win_percent` would exceed 100%. Clear fields on success; reset color to next palette default.

Display **Total: {sum}% / 100%** in the sectors panel (not only inside the dialog) so remaining headroom is visible while configuring the wheel.

### Sector list

| Column | Source |
|--------|--------|
| Color | swatch from `sector.color` |
| Label | `sector.label` |
| Win % | `sector.winPercent` with `%` suffix |
| Actions | **Edit** icon; **Delete** icon |

Empty state centered muted text: **No sectors yet. Add at least two to spin.**

Populated list updates immediately after add, edit, or delete without full page reload.

### Edit sector dialog

Opened from row **Edit**. Fields mirror add form:

| Field | Label (English) |
|-------|-----------------|
| Label | **Label** |
| Win % | **Win %** |
| Color | **Color** (`HexColorField`) |

Actions: **Cancel** / **Save** — `PATCH .../sectors/:sectorId` on save; close and refresh row on success; `StatusAlert` on validation error.

### Delete sector

Row **Delete** archives the sector (`DELETE .../sectors/:sectorId`). Confirm dialog optional (implementation choice). Row disappears from list; total win % indicator updates; success toast.

## 3. History card (winners)

Panel title: **History ({count})**

### Header actions

When `wins.length > 0`:

| Button | Label (English) | Behavior |
|--------|-----------------|----------|
| Export | **Download XLSX** | Client-side `.xlsx` build per `winners-export.md`; left of **Archive all** |
| Archive all | **Archive all** | Existing bulk soft-delete flow |

### Empty state

Centered muted text: **No winners yet.** No header action buttons.

### Populated state

Table or stacked rows:

| Column | Source |
|--------|--------|
| Nick | `win.participantNick` |
| Prize | `win.sectorLabel` |
| Time | locale date-time from `win.createdAt` (in expandable detail) |
| Action | **Remove** icon/button |

**Remove:** confirm dialog optional (implementation choice); calls `DELETE .../wins/:winId`; row disappears from list; success toast.

Newest winners first (`created_at DESC`).

## States

| State | UI |
|-------|------|
| Loading | Skeleton for header, three panels |
| Error (bad id, network) | `StatusAlert` error; **Back to history** link |
| Loaded, zero sectors | Empty sector message; spin disabled |
| Session ended | Existing **Ended** chip in header only — no extra disable logic in this slice |

## Visual contract

Match existing Prize Spin and Bonus Buy session patterns:

| Token / pattern | Usage |
|-----------------|-------|
| `cardSx` | All three panels |
| `inputFieldSx` | Nick, sector fields |
| `HexColorField` | Sector color on add form and edit dialog |
| `primary` | **Spin**, **+ Add sector**, **Save** |
| `AppTable` or `Stack` rows | Sector and winner lists |
| `StatusAlert` | Errors; remove placeholder info alert |

English copy only per adopted `spec-app-english-only`.

## Brownfield note

`PrizeSpinSessionPage` already loads the session record and supports **End session**. This companion adds the three workspace panels beneath the existing header card without changing history page (`/prize-spin`) behavior.
