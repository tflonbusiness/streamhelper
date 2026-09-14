# Caz Agent streaming OAuth auth — implementation breakdown

Source: `_bmad-output/specs/spec-streaming-oauth-auth/SPEC.md`, `schema.md`.

Depends on: Epic 1 (React app, NestJS server, landing, sessions).

Supersedes: Epic 2 (entire auth/account routing model). Touches Epic 3 roster UI (Story 4.7).

## Epic 4: Streaming OAuth auth and admin access links

Kick OAuth for owners; access-link login for admins. One account per owner (name = Kick username). No onboarding, picker, or contact-to-pay. Permanent admin revoke.

### Story 4.1: Postgres schema for streaming auth model

Implement `schema.md`: five tables. Remove email/password columns. `subscription_plan` replaces `is_active`. Seed: one Kick owner + one admin with access link.

**Acceptance Criteria:**

**Given** Postgres on server start
**Then** tables match `schema.md`
**And** no `email` or `password_hash` on `users`

**Given** dev seed
**Then** one owner (`auth_credentials kick`) with account + channel exists
**And** one admin (`auth_credentials access_link`) with active membership exists

### Story 4.2: Kick OAuth provider module

`AuthProvidersModule` with extensible interface. Kick fully implemented. Routes: `GET /auth/oauth/kick`, `GET /auth/oauth/kick/callback`. Document env vars for dev/mock.

**Acceptance Criteria:**

**Given** configured Kick OAuth env
**When** `GET /auth/oauth/kick`
**Then** browser redirects to Kick authorize URL

**Given** provider interface
**Then** future Twitch/YouTube adapters can be added without schema changes

### Story 4.3: Owner auto-provision on first Kick login

First Kick login: TX creates `users`, `auth_credentials`, `accounts` (name = Kick username), `account_members(owner)`, `account_channels`. Session includes account context. Re-login reuses existing rows.

**Acceptance Criteria:**

**Given** new Kick `provider_user_id`
**When** callback completes
**Then** all provision rows exist; `accounts.name` equals Kick username; `subscription_plan = 'free'`
**And** session has `accountId` and `role=owner`

**Given** existing Kick credential
**When** callback completes
**Then** no duplicate account created

### Story 4.4: Login page and landing — Kick only

Replace login form with «Войти через Kick». Remove `/register`. Update landing CTA. No Twitch/YouTube buttons in MVP.

**Acceptance Criteria:**

**Given** `/login`
**Then** single Kick OAuth button in Russian; no email/password fields

**Given** `/register`
**Then** route removed or redirects to login

**Given** landing page
**Then** CTA links to Kick OAuth login

### Story 4.5: Admin access link — create, list, permanent revoke

Owner-only: `POST /accounts/:id/admins` (name), `GET /accounts/:id/members`, `DELETE /accounts/:id/members/:userId` (permanent revoke). Atomic create TX. Revoke kills sessions; no reactivate.

**Acceptance Criteria:**

**Given** owner session
**When** POST admin with name
**Then** `users` + `auth_credentials(access_link)` + `account_members(admin)` created
**And** response includes one-time join URL

**Given** owner revokes admin
**Then** credential and membership `is_active = false` permanently
**And** admin sessions destroyed
**And** no reactivate endpoint exists

**Given** non-owner
**When** create/revoke attempted
**Then** 403

### Story 4.6: Admin join flow

`GET /join/:token` → validate → session with account context → redirect `/dashboard`. Russian error for invalid/revoked token.

**Acceptance Criteria:**

**Given** valid active token
**When** admin opens join URL
**Then** session created; redirect to dashboard

**Given** revoked or invalid token
**Then** no session; Russian error shown

### Story 4.7: Session guard, roster UI, instant revoke

Middleware checks active `auth_credentials`. Roster shows `name` not `email`; create-by-name form; revoke button (no reactivate). Revoked rows show «Отозван».

**Acceptance Criteria:**

**Given** authenticated request with all credentials inactive
**Then** session cleared; 401

**Given** admin revoked mid-session
**Then** next request fails auth

**Given** owner roster UI
**Then** name-based create form and permanent revoke; no email field

### Story 4.8: Remove legacy auth and dead routes

Delete email/password endpoints, bcrypt, `/onboarding`, `/picker`, `/contact`, `/app` router, `select-account`, `memberships` APIs. Post-login → `/dashboard` only.

**Acceptance Criteria:**

**Given** `auth.controller.ts`
**Then** no register/login email endpoints

**Given** `App.tsx`
**Then** no onboarding, picker, contact, or accountIsActive guards
**And** authenticated users route to dashboard

**Given** `subscription_plan=free`
**Then** dashboard accessible (no contact-to-pay)

### Story 4.9: E2E tests and dev seed

Rewrite auth e2e for Kick OAuth mock, admin join, permanent revoke. Document dev env vars.

**Acceptance Criteria:**

**Given** `auth.e2e-spec.ts`
**When** tests run
**Then** cover owner login, admin join, revoke blocks re-login
**And** all pass
