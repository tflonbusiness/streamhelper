# Epic 4 Context: Streaming OAuth auth and admin access links

<!-- Compiled from planning artifacts. Edit freely. -->

## Goal

Replace email/password with Kick OAuth for owners and access-link login for admins. Schema: `users`, `auth_credentials`, `accounts`, `account_members`, `account_channels`. Remove onboarding, picker, contact-to-pay, and multi-account flows. One account per owner; account name = Kick username. Permanent admin revoke.

## Spec

`_bmad-output/specs/spec-streaming-oauth-auth/SPEC.md`, `schema.md`.

## Stories

- Story 4.1: Postgres schema for streaming auth model
- Story 4.2: Kick OAuth provider module (extensible interface)
- Story 4.3: Owner auto-provision on first Kick login
- Story 4.4: Login page and landing — Kick button only
- Story 4.5: Admin access link — create, list, permanent revoke
- Story 4.6: Admin join flow and session
- Story 4.7: Unified session guard, roster UI, instant revoke
- Story 4.8: Remove legacy auth, onboarding, picker, contact routes
- Story 4.9: E2E tests and dev seed

## Resolved product decisions

- **D-1:** Kick only for MVP; Twitch/YouTube later (extensible provider interface)
- **D-2:** Remove onboarding completely
- **D-3:** One account per owner; no picker, no select-account
- **D-4:** `accounts.name` = Kick username on provision
- **D-5:** Admin revoke is permanent — no reactivate
- Admin login: reusable access link until revoked
- Admin user row created when owner generates link
- No email/password; no `isActive` gate
- `subscription_plan` defaults to `free`; tier limits deferred

## Requirements & Constraints

- Backend: `server/` (NestJS + Postgres + express-session)
- Frontend: `app/` (Russian UI)
- Landing: `landing/` — Kick OAuth CTA
- Store only `token_hash` for access links

## Epic 2 / 3 Relationship

**Supersedes** Epic 2 entirely for auth/routing. Epic 3 roster UI updated in 4.7 (name + revoke, no email/reactivate).

## Cross-Story Dependencies

- 4.1 → all
- 4.2 → 4.3
- 4.3 → 4.4
- 4.5 → 4.6, 4.7
- 4.8 after 4.3–4.7
- 4.9 last
