---
id: SPEC-streaming-oauth-auth
companions:
  - schema.md
  - kick-oauth-setup.md
  - functional-requirements.md
  - ../spec-caz-agent-ui-improvement/design-tokens.md
  - ../spec-caz-agent-ui-improvement/components.md
  - ../../implementation-artifacts/epic-4-context.md
  - ../../planning-artifacts/epics-caz-agent-streaming-auth.md
sources:
  - ../../brainstorming/brainstorm-kick-auth-login-2026-09-13/.memlog.md
supersedes:
  - ../spec-user-account-model/SPEC.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability only.

# Caz Agent — Kick OAuth auth and admin access links

## Why

Caz Agent targets streamers; identity must come from streaming platforms, starting with Kick. Epic 1 shipped email/password login and an `isActive` gate — both block the product direction. Owners need one-click Kick login with automatic account creation; team admins need delegated access without registration. The product welcomes all streamers on a free tier immediately and gates features by subscription later, not dashboard access upfront.

## Capabilities

- **CAP-1**
  - **intent:** A streamer can log in with Kick OAuth without email or password.
  - **success:** Authorize flow reaches Kick (or documented mock in dev); callback establishes a server session with account context; no email/password fields remain in the system.

- **CAP-2**
  - **intent:** A first-time Kick login auto-provisions a free account and dashboard access.
  - **success:** One transaction creates `users`, `auth_credentials`, `accounts`, `account_members(owner)`, `account_channels`; `accounts.name` equals Kick username; `subscription_plan = 'free'`; user lands on `/dashboard`.

- **CAP-3**
  - **intent:** An owner can create a named admin with a reusable access link.
  - **success:** Atomic insert of `users`, `auth_credentials(access_link)`, `account_members(admin)`; API returns one-time plain join URL; admin user exists before first click.

- **CAP-4**
  - **intent:** An admin can log in via access link and reach the dashboard.
  - **success:** Valid token creates session with account context; invalid or revoked token shows a Russian error; no registration step.

- **CAP-5**
  - **intent:** An owner can permanently revoke an admin and immediately end their session.
  - **success:** Revoke sets `auth_credentials.is_active = false` and `account_members.is_active = false`; admin sessions destroyed; reactivate is not supported.

- **CAP-6**
  - **intent:** All authenticated users reach the dashboard — no inactive-account or onboarding gates.
  - **success:** `/contact`, `/onboarding`, `/picker` routes removed; routing does not check legacy `isActive`.

- **CAP-7**
  - **intent:** Session auth is unified across Kick owners and link-based admins.
  - **success:** Middleware verifies at least one active `auth_credentials` row per session `userId` on protected requests.

- **CAP-8**
  - **intent:** Owner manages team roster by name and link status, not email.
  - **success:** Dashboard roster shows `name`, `role`, active/revoked status; create form uses display name; no reactivate control.

- **CAP-9**
  - **intent:** Login and landing surfaces expose Kick OAuth in Russian.
  - **success:** Login page shows «Войти через Kick» only; register removed; landing CTA points to OAuth login.

## Constraints

- Postgres in `server/`; NestJS + express-session; product UI in `app/`; landing in `landing/`.
- **Project-wide UI stack:** all `app/` surfaces (Kick login, dashboard, admin flows) use shadcn/ui on `@radix-ui/*` per adopted `design-tokens.md` and `components.md` — no alternate UI libraries or hand-rolled interactive primitives.
- Kick OAuth 2.1 requires PKCE (`S256`) and cryptographically random `state` validated on callback — see `kick-oauth-setup.md`.
- OAuth client secrets only in server env vars; never in the client bundle.
- No email/password anywhere; greenfield schema — no migration of Epic 1 mock users.
- Owner has exactly one account; admin login via access link only.
- Twitch/YouTube OAuth deferred; provider interface and schema stay extensible.
- `subscription_plan` tier limits and payment processing deferred.

## Non-goals

- Twitch/YouTube OAuth or multi-provider linking in MVP.
- Persisting Kick refresh tokens after login (login-only flow).
- Payment processing, paid plan enforcement, or email notifications.
- Admin reactivation after revoke, account name editing, or onboarding/picker/switch-account UI.
- Third role (`member`) or granular permissions beyond owner/admin.
- Migrating production data from the email-based model.

## Success signal

A visitor clicks «Войти через Kick», completes OAuth (mock or real), lands on an auto-provisioned dashboard. The owner creates an admin, the admin joins via link, and the owner revokes them permanently. No onboarding, picker, contact, or email/password paths remain. Dev mock and e2e tests pass; production mode works with documented Kick app credentials.

## Assumptions

- Kick access token at callback time is sufficient to call `GET https://api.kick.com/public/v1/users` for profile data.
- Session store can delete sessions by `user_id`.
- Revoked admin retrying an old link sees the join error page.
- Dev uses Vite proxy (`/auth` → server) so redirect URI can stay on the app origin when registered that way in Kick.
