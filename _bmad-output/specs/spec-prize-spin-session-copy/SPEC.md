---
id: SPEC-prize-spin-session-copy
companions:
  - session-copy.md
  - ../spec-prize-spin-history-archive/session-status.md
  - ../spec-prize-spin-session-page/prize-spin-sectors.md
  - ../spec-prize-spin-history-archive/SPEC.md
  - ../spec-app-english-only/SPEC.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Caz Agent — Prize Spin copy session (sectors only)

## Why

**Pain:** Operators reuse the same prize wheel layout (sector labels, weights, and colors) across multiple stream sessions but today must re-enter every sector manually after **New**. Starting a fresh session with an empty winners list while keeping the configured wheel saves setup time and avoids mistakes when percentages must match a proven layout.

**Who:** Owner or moderator on an active Caz Agent account (English UI, `/modules/prize-spin` History).

## Capabilities

- **CAP-1**
  - **intent:** An operator starts copying an existing prize spin session from the History table and confirms the new session title in a dialog.
  - **success:** Each History row has a **Copy session** action enabled for active and archived sources; dialog **Copy session** shows source title read-only, editable **Title** for the new session with default `{source title} (copy)`; **Create copy** calls the copy API; **Cancel** closes without changes; patterns match `session-copy.md`.

- **CAP-2**
  - **intent:** The system creates a new active prize spin session whose non-archived wheel sectors match the source session.
  - **success:** `POST /accounts/:accountId/prize-spins/:sourceId/copy` returns `201` and a new `PrizeSpinRecord` with `status = 'active'`; every source `prize_spin_sector` with `is_archived = false` exists on the new session with the same `label`, `win_percent`, `color`, and `sort_order`; archived source sectors are omitted; source session is unchanged; source with zero active sectors yields a new session with zero sectors.

- **CAP-3**
  - **intent:** The copied session does not inherit source session metadata or any spin history.
  - **success:** New session uses the operator-provided title, not the source title; new `created_by_user_id` is the copying operator; source `status` unchanged; zero `prize_spin_win` rows on the new session; winners UI empty; operator may spin and record new wins independently.

## Constraints

- **English UI** on dialog, tooltips, toasts, and buttons per adopted `spec-app-english-only`.
- **Account-scoped auth** on copy endpoint; source `prize_spin.account_id` must match `:accountId`; missing or foreign source → `404`.
- **Atomic copy** — one server transaction for session and sector inserts; no partial copy on failure.
- **Sectors only** — copy non-archived `prize_spin_sector` rows; never insert `prize_spin_win`.
- **No widget bootstrap on copy** — do not insert `prize_spin_widget` (account-level settings unchanged).
- **Source status** — copy allowed when source is `active` or `archived`; new session always `active`.
- **Navigation** — after success, client navigates to `/modules/prize-spin/:newId` and shows toast **Session copied.**
- **MUI patterns** — History row actions and dialog consistent with `PrizeSpinCreateDialog`, `PrizeSpinArchiveDialog`, and `AppTable` on `PrizeSpinPage`.
- **Title validation** — same rules as create session (trimmed, 1–200 chars) → `400` when invalid.
- **Sector rules** — copied weights follow `prize-spin-sectors.md`; copy does not normalize invalid source totals.
- **Routes** — use `prizeSpinSessionRoute` from `app/src/lib/routes.ts`; History page remains `/modules/prize-spin`.

## Non-goals

- Copying spin history, winners, or participant nicks (`prize_spin_win`).
- Copying session title automatically without operator edit (title is always chosen in the dialog, with a suggested default only).
- Copying archived sectors from the source wheel.
- Copying or resetting source session `status`, widget settings, or overlay behavior.
- Bulk copy (multiple sessions at once).
- In-place merge into an existing session (always creates a new `prize_spin` row).
- Unarchive or modify the source session as part of copy.

## Success signal

An operator opens `/modules/prize-spin`, clicks **Copy session** on a session with five configured sectors and forty recorded wins, sets title **Saturday wheel**, confirms — lands on a new session whose sector list matches the source layout, winners table empty, ready to spin. The source session still shows all forty wins unchanged.

## Assumptions

- Operators want a clean winners list on the new session; sector layout reuse is the primary value.
- Copy from a session with no sectors behaves like **New** but with a pre-filled title suggestion from the source.
