---
id: SPEC-user-account-model
companions:
  - schema.md
  - ../spec-caz-agent-ui-improvement/components.md
  - ../../implementation-artifacts/epic-1-context.md
sources:
  - ../../brainstorming/brainstorm-user-account-model-2026-09-11/.memlog.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate.

# Caz Agent user, account, and membership model

## Why

Epic 1 shipped a flat `users.is_active` gate, but Caz Agent is a team product: one owner pays for a subscription and moderators operate the dashboard. Registration establishes identity only; creating an owned account is a deliberate later step. Users may also moderate other teams while owning their own account. The mandate is named accounts as the billing boundary, membership roles, post-login orchestration (onboarding, picker, routing), and dashboard vs contact-to-pay flows scoped to the selected account.

> **Note:** `spec-streaming-oauth-auth` supersedes parts of this spec for the live Kick OAuth + access-link auth model. Role terminology here is aligned: `moderator` replaces legacy `admin`.

## Capabilities

- **CAP-1**
  - **intent:** A user can register with email and password without creating an account.
  - **success:** Registration creates a `users` row only; no `accounts` or `account_members` rows are created.

- **CAP-2**
  - **intent:** A logged-in user with no active memberships can choose to create their own account or wait to be added to someone else's.
  - **success:** Onboarding in `app/` always offers both paths while membership count is zero; wait shows a hold screen; user may return to onboarding and create an account later if they do not yet own one.

- **CAP-3**
  - **intent:** A user who does not yet own an account can create their one allowed account by supplying a valid name.
  - **success:** Explicit create-account inserts `accounts` and `account_members(role=owner)`; name is trimmed, 2–100 characters; a second create attempt is rejected.

- **CAP-4**
  - **intent:** An owner can add an already-registered user as a moderator by email.
  - **success:** A known email inserts or reactivates `account_members(role=moderator, is_active=true)`; unknown email returns not-found; only the account owner may perform this action.

- **CAP-5**
  - **intent:** An owner can deactivate or reactivate a moderator's membership without deleting the row.
  - **success:** `account_members.is_active` toggled for `role=moderator`; deactivated moderators lose access until reactivated; owner row cannot be toggled this way.

- **CAP-6**
  - **intent:** Routing for the selected account respects team subscription and membership state.
  - **success:** Active membership + `accounts.is_active=true` → dashboard; active membership + `accounts.is_active=false` → contact-to-pay.

- **CAP-7**
  - **intent:** A user with more than one active membership chooses which account to enter after login.
  - **success:** `/dashboard` picker mode lists `accounts.name` and role; selection sets session account context and applies CAP-6.

- **CAP-8**
  - **intent:** The server exposes memberships and sets session account context after verifying membership.
  - **success:** `GET` memberships returns id, name, role, and `account_is_active`; `POST` select-account rejects non-members and updates session fields used by CAP-6.

- **CAP-9**
  - **intent:** A user can switch the active account from the dashboard without logging out.
  - **success:** Switch-account UI clears session account context and shows `/dashboard` picker mode; successful select-account updates session and re-routes per CAP-6.

- **CAP-10**
  - **intent:** A single post-login router decides onboarding, team selection, or account routing.
  - **success:** 0 active memberships → onboarding; 1 → auto select-account; 2+ → `/dashboard` picker mode; then CAP-6 for the selected account.

## Constraints

- Postgres in `server/`; three tables: `users`, `accounts`, `account_members` — no invite table, no access-key table.
- Registration never auto-creates an account.
- Roles: `owner` and `moderator` only.
- All authentication uses email and password on `users`.
- A user may own at most one account (`accounts.owner_user_id` unique).
- The same user may be `owner` on their account and `moderator` on unlimited other accounts.
- `accounts.name`: trimmed, length 2–100, not globally unique.
- `accounts.is_active` is the team subscription flag; toggled in demo via seed plus documented dev SQL/script (not owner UI in this epic).
- `account_members.is_active` gates moderator access; owners are not deactivated through this flag.
- `account_members` row with `role=owner` must reference the same `user_id` as `accounts.owner_user_id`.
- Only the account owner may add or disable moderators on that account.
- Surrogate keys are `BIGSERIAL`; every table has `created_at` and `updated_at`.
- Owner adds only existing `users` by email.
- UI in `app/` uses Russian copy per Epic 1.
- **Project-wide UI stack:** onboarding, picker, and account flows in `app/` use shadcn/ui on `@radix-ui/*` per adopted `components.md`.
- Full DDL in companion `schema.md`.

## Non-goals

- Moderator access keys, invite tokens, `account_invites`, or email notification when added as moderator.
- Hard-deleting `account_members` rows in this epic (disable only).
- A third `member` role, soft delete, subscription enums, or live billing.
- Telegram, OAuth, or other identity providers.
- Owning more than one account; auto-provisioning an account on registration.
- Legacy `admin` role values.

## Success signal

Register and login with zero memberships → onboarding (create or wait); create-account → inactive account routes to contact-to-pay; dev SQL activates account → dashboard home; moderator added by owner appears after login; user with two memberships sees `/dashboard` picker mode; switch-account from dashboard returns to picker mode; owner disabling moderator removes that team from membership list; disabled moderator with zero memberships returns to onboarding with both options.

## Assumptions

- `updated_at` is set by application code on `UPDATE` unless triggers are added later.
- Register page is part of CAP-1 delivery (email, password, Russian copy).
