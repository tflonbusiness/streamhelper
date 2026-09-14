# Epic 2 Context: Accounts, memberships, and team access

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Replace Epic 1 flat `users.is_active` with named accounts. Registration is identity-only; account creation is explicit. Post-login: onboarding → picker (if needed) → select-account → dashboard or contact-to-pay. Owner manages admins by email (disable only). User can switch account from dashboard.

## Spec

`_bmad-output/specs/spec-user-account-model/SPEC.md`, `schema.md`.

## Stories

- Story 2.1: Postgres schema for users, accounts, and account_members
- Story 2.2: Register page and API (users row only)
- Story 2.3: Post-login onboarding (zero memberships)
- Story 2.4: Create owned account with name
- Story 2.5: Memberships API and select-account session
- Story 2.6: Post-login router and account picker
- Story 2.7: Route by accounts.is_active
- Story 2.8: Switch account from dashboard
- Story 2.9: Owner add and disable admin by email
- Story 2.10: Update auth e2e tests

## Resolved product decisions

- Switch account from dashboard: **yes**
- `accounts.name`: trim, **2–100 chars**, not globally unique
- Zero memberships: onboarding always offers **create or wait** (not locked on wait)
- Remove admin: **`is_active=false` only** (no delete this epic)
- Demo activation: **seed + documented dev SQL** for `accounts.is_active`
- Admin notification when added: **out of scope**

## Requirements & Constraints

- Tables: `users`, `accounts`, `account_members`
- Owner CHECK: `account_members(role=owner)` must match `accounts.owner_user_id`
- Only account owner may add/disable admins
- Session: `accountId`, `accountName`, `role`, `accountIsActive`
- Russian UI in `app/`; auth in `server/`

## Cross-Story Dependencies

- 2.1 before all auth/membership work
- 2.2 register before 2.3 onboarding
- 2.5 select-account before 2.6 router and 2.8 switch
- 2.6 replaces Epic 1 routing before 2.7 behavior is reachable
- 2.9 depends on owner session with account context
- 2.10 after API/session shape stabilizes

## Epic 1 Relationship

Epic 1 login/dashboard/contact/landing remain. Epic 1 Story 1.4 routing superseded by 2.6 + 2.7.
