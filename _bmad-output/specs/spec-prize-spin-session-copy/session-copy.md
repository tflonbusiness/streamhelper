# Prize Spin History — copy session (sectors only)

Copy an existing prize spin session into a **new** `active` session from the History table on `/modules/prize-spin`. Operator-facing scope: **wheel sectors** (`prize_spin_sector`, non-archived) only — not spin history, not the source title, not `status`.

## Terminology

| Term in spec | Data |
|--------------|------|
| **Sector** | Wheel slice — row in `prize_spin_sector` with `is_archived = false` |
| **Spin history** | `prize_spin_win` rows — **not** copied |

## API

### Copy session

| Method | Route | Body | Response |
|--------|-------|------|----------|
| `POST` | `/accounts/:accountId/prize-spins/:sourcePrizeSpinId/copy` | `{ "title": string }` | `201` + `PrizeSpinRecord` |

**Auth:** session cookie + account membership; `prize_spin.account_id` must equal `:accountId` for the source row.

**Errors:**

| Condition | Status |
|-----------|--------|
| Source not found or wrong account | `404` |
| Invalid title (empty, > 200) | `400` |
| Invalid JSON / missing `title` | `400` |

**Transaction (single `BEGIN` … `COMMIT`):**

1. Load source `prize_spin` by id + account (any `status` — `active` or `archived`).
2. `INSERT` new `prize_spin` with `title` from body (trimmed), `status = 'active'`, `created_by_user_id` = caller. Do **not** insert `prize_spin_widget` (account-level row already exists).
3. Load source sectors: `prize_spin_sector` where `prize_spin_id = source` and `is_archived = false`, order `sort_order ASC, id ASC`.
4. For each sector, `INSERT` on the new session: `label`, `win_percent`, `color`, `sort_order`; new ids assigned.
5. Return new session as `PrizeSpinRecord` (same shape as `POST .../prize-spins`).

**Not copied:** source `title`, `status`, session `created_at` / `created_by_*`; any `prize_spin_win` rows (archived or not); archived source sectors; widget dimensions; overlay state.

**Empty sector list on source:** steps 3–4 no-op — new session has zero sectors and zero wins.

**Post-copy invariants:** copied sector set should satisfy the same rules as manual sector CRUD (sum of `win_percent` ≤ 100 per `prize-spin-sectors.md`); copy does not auto-fix an invalid source wheel — if source violates sum, copied session inherits the same numeric values.

**Client** (`app/src/api/prize-spin.ts`):

- `copyPrizeSpin(accountId, sourcePrizeSpinId, title)` → `PrizeSpinRecord`

**Server:** `authService.copyPrizeSpin` + `database.copyPrizeSpin` (or equivalent); route on `accounts.controller.ts`.

## UI (`PrizeSpinPage` History card)

### Row action

| Control | Placement | Behavior |
|---------|-----------|----------|
| **Copy** | Icon button in row actions between **Archive** and **Open** | Opens copy dialog; enabled for **Active** and **Archived** rows |

Tooltip **Copy session**. Icon: `ContentCopy` (or equivalent MUI copy icon). Widen action column min width to fit three icon buttons.

### Dialog (`PrizeSpinCopyDialog`)

Pattern: `PrizeSpinCreateDialog` + `PrizeSpinArchiveDialog`.

| Element | Copy |
|---------|------|
| Title | **Copy session** |
| Body | Explains a **new** session is created; **only wheel sectors** copy from the source; **spin history and winners are not** copied; source session is unchanged. Show source session **title** as read-only text. |
| Field | **Title** for the new session — `createPrizeSpinFormSchema` / Yup same as **New Session** |
| Default title | `{source.title} (copy)` truncated to 200 characters |
| Primary | **Create copy** |
| Secondary | **Cancel** |
| Success toast | **Session copied.** |
| After success | Close dialog; invalidate prize spin list query; `navigate(prizeSpinSessionRoute(newId))` |

Loading state on primary button while `POST` in flight; disable close on pending if matching create dialog behavior.

### Queries

- `useCopyPrizeSpin(accountId)` mutation wrapping `copyPrizeSpin`

## Verification notes

- New session **Sectors** card matches source non-archived sectors (labels, weights, colors, order).
- New session **Winners** list is empty.
- Source session sectors and wins unchanged after copy.
- Copy from archived source works; new session is editable (`status = active`).
