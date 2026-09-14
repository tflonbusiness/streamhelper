# Caz Agent accounts & team access — implementation breakdown

Source: `_bmad-output/specs/spec-user-account-model/SPEC.md`, `schema.md`.

Depends on: Epic 1 (login shell, dashboard, contact-to-pay, landing, Postgres in `server/`).

## Epic 2: Accounts, memberships, and team access

Replace flat `users.is_active` with named accounts. Registration is identity-only; account creation is explicit. Post-login orchestration: onboarding → picker (if needed) → select-account → dashboard or contact-to-pay. Owner manages admins by email (disable only, no delete).

### Story 2.1: Postgres schema for users, accounts, and account_members

Migrate to three-table model per `schema.md`: `BIGSERIAL`, timestamps, `accounts.name` (2–100 chars), owner integrity CHECK, indexes. Reshape seed: demo owner/admin users, active and inactive accounts. Document dev SQL to toggle `accounts.is_active`.

**Acceptance Criteria:**

**Given** Postgres on server start
**Then** tables match `schema.md` including owner CHECK constraint
**And** seed includes active and inactive owned accounts
**And** a documented SQL snippet can set `accounts.is_active = true` for local demo

**Given** Epic 1 flat `users.is_active`
**When** migration completes
**Then** gating uses `accounts.is_active` only

### Story 2.2: Register page and API (users row only)

Registration in `server/` and register page in `app/` (Russian). Creates `users` only — no account (CAP-1).

**Acceptance Criteria:**

**Given** new email and password on register page
**When** user submits
**Then** `users` row is created with hashed password
**And** no `accounts` or `account_members` rows
**And** user can log in afterward

### Story 2.3: Post-login onboarding (zero memberships)

When user has zero active memberships, show onboarding with **create account** and **wait** (CAP-2). Wait shows hold screen. User may later create own account from onboarding if they do not own one yet.

**Acceptance Criteria:**

**Given** logged-in user, zero active memberships
**Then** onboarding shows both options in Russian
**And** dashboard and contact-to-pay are not shown

**Given** user on wait with zero memberships
**When** they still do not own an account
**Then** onboarding remains available with create-account option

### Story 2.4: Create owned account with name

API + UI to create account (CAP-3). Name trimmed, 2–100 chars. Reject second owned account.

**Acceptance Criteria:**

**Given** user without owned account submits valid name
**Then** `accounts` + `account_members(owner)` created; `is_active` defaults false
**And** session selects new account and routes to contact-to-pay

**Given** user who already owns an account
**When** create-account is called
**Then** request is rejected

**Given** name shorter than 2 or longer than 100 after trim
**Then** request is rejected

### Story 2.5: Memberships API and select-account session

Implement `GET /auth/memberships` and `POST /auth/select-account` (CAP-8). Server verifies active membership before setting session account fields.

**Acceptance Criteria:**

**Given** logged-in user with active memberships
**When** GET memberships
**Then** response lists accountId, name, role, accountIsActive

**Given** accountId user is not an active member of
**When** POST select-account
**Then** request is rejected

**Given** valid accountId
**When** POST select-account
**Then** session includes accountId, accountName, role, accountIsActive

### Story 2.6: Post-login router and account picker

Single router after login (CAP-10, CAP-7): 0 → onboarding; 1 → auto select; 2+ → Russian picker. Replace Epic 1 `user.isActive` redirects in `App.tsx` / `ProtectedRoute`.

**Acceptance Criteria:**

**Given** one active membership after login
**Then** account is auto-selected without picker

**Given** two or more active memberships
**Then** picker shows names and roles; selection calls select-account then routes

**Given** Epic 1 GuestRoute/ProtectedRoute using `user.isActive`
**When** this story ships
**Then** routing uses session account context and CAP-6 rules instead

### Story 2.7: Route by accounts.is_active

After account selected, route to dashboard or contact-to-pay (CAP-6).

**Acceptance Criteria:**

**Given** selected account with `is_active=true`
**Then** dashboard (Russian, title Caz Agent)

**Given** selected account with `is_active=false`
**Then** contact-to-pay (mock Telegram/email from Epic 1)

**Given** admin with `account_members.is_active=false`
**Then** that account is excluded from memberships and picker

### Story 2.8: Switch account from dashboard

Switch-account control in dashboard (CAP-9). Reopens picker or list; select-account re-routes without logout.

**Acceptance Criteria:**

**Given** user with 2+ active memberships inside dashboard
**When** they choose switch account and pick another team
**Then** session updates and routing re-evaluates per CAP-6

### Story 2.9: Owner add and disable admin by email

Owner-only API + minimal UI (CAP-4, CAP-5). Add registered user by email; disable sets `is_active=false` (no row delete). Unknown email → not-found.

**Acceptance Criteria:**

**Given** account owner and registered email
**When** owner adds admin
**Then** `account_members(admin, is_active=true)` created or reactivated

**Given** non-owner session
**When** add/disable admin is attempted
**Then** request is rejected

**Given** active admin
**When** owner disables them
**Then** `is_active=false`; admin loses that account until reactivated

**Given** owner row
**When** disable attempted on self
**Then** rejected

### Story 2.10: Update auth e2e tests

Replace Epic 1 e2e expectations (`user.isActive`) with account-scoped session and membership flows.

**Acceptance Criteria:**

**Given** `server/test/auth.e2e-spec.ts`
**When** tests run against new model
**Then** they cover login, select-account routing, and reject invalid select-account
**And** all tests pass
