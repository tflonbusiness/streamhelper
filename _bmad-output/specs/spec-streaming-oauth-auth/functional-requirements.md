# Functional and non-functional requirements

Preserved from prior SPEC iteration and brainstorming. Maps to Epic 4 stories in `../../planning-artifacts/epics-caz-agent-streaming-auth.md`.

## Personas

| Persona | Auth method | Provisioning |
|---------|-------------|--------------|
| **Owner** (streamer) | Kick OAuth (MVP) | Auto on first Kick login — one account per owner |
| **Moderator** (team member) | Reusable access link `/join/{token}` | Owner creates by display name |

## Resolved decisions

| # | Decision |
|---|----------|
| D-1 | MVP provider: Kick only. Twitch/YouTube deferred. |
| D-2 | Remove onboarding completely (`/onboarding`, create-or-wait). |
| D-3 | Owner has exactly one account. No picker or `select-account`. |
| D-4 | `accounts.name` = Kick `provider_username` on auto-provision; not user-editable in this epic. |
| D-5 | Moderator revoke is permanent — no reactivate. |
| D-6 | Membership role `moderator` replaces legacy `admin` in DB, API, types, and UI. |

## Authentication — Owner (Kick OAuth)

| ID | Requirement |
|----|-------------|
| FR-1 | `GET /auth/oauth/kick` redirects to Kick authorize URL (or mock). |
| FR-2 | `GET /auth/oauth/kick/callback` handles code exchange and session creation. |
| FR-3 | Provider module interface supports future `twitch` / `youtube` adapters without schema changes. |
| FR-4 | Callback looks up `auth_credentials` by `(provider='kick', provider_user_id)`. |
| FR-5 | Missing credential triggers auto-provision (CAP-2). |
| FR-6 | Existing credential reuses `user_id` without duplicating rows. |
| FR-7 | `accounts.name` and `users.name` set to Kick `provider_username` on auto-provision. |
| FR-8 | Owner has at most one account; second provision reuses existing account. |

## Authentication — Moderator (access link)

| ID | Requirement |
|----|-------------|
| FR-9 | Owner calls `POST /accounts/:accountId/moderators` with `{ "name": string }`. |
| FR-10 | Create-moderator generates random token; stores `token_hash` only; returns plain URL once. |
| FR-11 | `GET /join/:token` validates hash, checks `is_active`, creates session, redirects to `/dashboard`. |
| FR-12 | Access links are reusable until permanently revoked. |
| FR-13 | One access link credential per moderator user (1:1). |
| FR-14 | Revoke endpoint permanently deactivates credential + membership and destroys moderator sessions. |
| FR-15 | Revoked moderator cannot be reactivated; owner creates a new moderator for replacement. |

## Session and authorization

| ID | Requirement |
|----|-------------|
| FR-16 | Session stores `userId`, `name`, `accountId`, `accountName`, `role` — set on login. |
| FR-17 | Protected routes reject requests when no active `auth_credentials` for session `userId`. |
| FR-18 | Only account owner may create or revoke moderators. |
| FR-19 | Roles are `owner` and `moderator` only. |
| FR-20 | Owner session resolves to single owned account; moderator session to membership account. |

## Data model

| ID | Requirement |
|----|-------------|
| FR-21 | Five tables per `schema.md`. |
| FR-22 | `users` has no `email`, `password_hash`, or provider columns. |
| FR-23 | `accounts.subscription_plan TEXT DEFAULT 'free'`; no `owner_user_id`, no `is_active`. |
| FR-24 | Owner via `account_members.role = 'owner'`; exactly one owner per account. |
| FR-25 | All tables use `BIGSERIAL` ids and `created_at` / `updated_at`. |
| FR-26 | Migrate `account_members.role = 'admin'` rows to `moderator`; update CHECK constraint. |

## UI and routing

| ID | Requirement |
|----|-------------|
| FR-27 | Login page: single «Войти через Kick»; register removed. |
| FR-28 | Remove `/register`, `/onboarding`, `/picker`, `/contact`, post-login router. |
| FR-29 | After auth, redirect to `/dashboard`. |
| FR-30 | Landing CTA links to Kick OAuth login. |
| FR-31 | Moderator roster API returns `name` instead of `email`. |
| FR-32 | Join error page: «Ссылка недействительна или отозвана». |
| FR-33 | Remove `GET /auth/memberships` and `POST /auth/select-account`. |

## Removal (legacy)

| ID | Requirement |
|----|-------------|
| FR-34 | Remove `POST /auth/register` and `POST /auth/login`. |
| FR-35 | Remove bcrypt password hashing. |
| FR-36 | Remove Epic 1 mock users seeded by email. |
| FR-37 | Remove `AccountPickerPage`, `OnboardingPage`, `ContactPage`, related guards. |
| FR-38 | Remove `POST /accounts/:id/admins` and `admin` role values — replaced by moderators. |

## Non-functional requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | Plain access tokens never stored; only `token_hash` (bcrypt or argon2). |
| NFR-2 | OAuth client secrets only in server env vars. |
| NFR-3 | Session cookies HTTP-only, secure in production, SameSite appropriate. |
| NFR-4 | Moderator session invalidation within next HTTP request after revoke. |
| NFR-5 | All user-facing auth UI copy in Russian. |
| NFR-6 | Mock Kick OAuth or documented env vars for local dev. |
| NFR-7 | E2E tests cover Kick OAuth mock, moderator join, permanent revoke. |
| NFR-8 | Adding Twitch/YouTube later requires only a new provider adapter + UI button. |

## API surface (MVP)

| Method | Path | Who | Purpose |
|--------|------|-----|---------|
| GET | `/auth/oauth/kick` | guest | Start Kick OAuth |
| GET | `/auth/oauth/kick/callback` | guest | Complete Kick OAuth |
| GET | `/join/:token` | guest | Moderator login |
| POST | `/accounts/:id/moderators` | owner | Create moderator + link |
| GET | `/accounts/:id/members` | member | Roster |
| DELETE | `/accounts/:id/members/:userId` | owner | Permanently revoke moderator |

Removed: register, login, memberships, select-account, `/admins`.

## UX requirements

| ID | Requirement |
|----|-------------|
| UX-1 | Login: single «Войти через Kick»; title «Caz Agent». |
| UX-2 | After login, land on `/dashboard`. |
| UX-3 | Create-moderator success: copyable join URL with Russian instruction. |
| UX-4 | Revoked moderator row: badge «Отозван»; no reactivate button. |
| UX-5 | Join error: «Ссылка недействительна или отозвана». |

## FR → Epic story map

| Stories | FRs |
|---------|-----|
| 4.1 | FR-21–26, FR-36 |
| 4.2 | FR-1–3, NFR-2, NFR-6, NFR-8 |
| 4.3 | FR-4–8, CAP-2 |
| 4.4 | FR-27, FR-30, CAP-9, UX-1 |
| 4.5 | FR-9–10, FR-13–15, CAP-3, CAP-5 |
| 4.6 | FR-11–12, FR-32, CAP-4, UX-5 |
| 4.7 | FR-14–20, FR-31, CAP-5, CAP-7, CAP-8, NFR-4, UX-3–4 |
| 4.8 | FR-28–29, FR-33–35, FR-37–38, CAP-6 |
| 4.9 | NFR-7 |
