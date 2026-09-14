# Epic 3 Context: Team dashboard and modules hub

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Make `/dashboard` the team home — summary, mock stats, admin roster, and inline team picker for multi-team users. Persistent nav shell links to `/modules` for streamer module catalog. Module toggles and stats are client-side mocks only.

## Spec

`_bmad-output/specs/spec-caz-team-dashboard/SPEC.md` and companions.

Adopted UI tokens: `spec-caz-agent-ui-improvement/design-tokens.md`, `components.md`.

Account model: `spec-user-account-model/SPEC.md` (picker presentation updated to dashboard picker mode).

## Stories

- Story 3.1: GET members API and admin PATCH authorization
- Story 3.2: App shell, routing, and inline team picker
- Story 3.3: Dashboard home — team card, mock stats, admin roster
- Story 3.4: Modules page with catalog toggles
- Story 3.5: Mock game cards when games module enabled
- Story 3.6: Integration smoke and build verification

## Resolved product decisions

- Team picker: **embedded in `/dashboard` picker mode** — no standalone `/picker` route
- Module persistence: **`localStorage` key `caz-modules-{accountId}`** until backend table exists
- Admin PATCH: **owner and admin** may toggle admin rows; owner-only POST add admin
- Mock stats: **static demo numbers** with «демо-данные» hint — no stats API
- Games module: **name-only mock cards** when `casino-stream-games` enabled — no runtime
- Nav placeholders: **История** and **Настройки** disabled with «скоро»

## Requirements & Constraints

- Shell routes: `/dashboard` (home or picker mode), `/modules` (active account only)
- Role matrix: owner — add admin + toggle admin + toggle modules; admin — toggle admin + toggle modules, no add admin
- `GET /accounts/:accountId/members` — contract in `members-api.md`
- Russian UI, dark shadcn, Caz Agent branding
- Do not change `select-account`, onboarding, or contact-to-pay API logic

## Cross-Story Dependencies

- 3.1 before 3.3 (roster API)
- 3.2 before 3.3, 3.4 (shell and picker routing)
- 3.4 before 3.5 (module toggle state)
- 3.6 after all feature stories

## Epic 2 Relationship

Epic 2 delivered accounts, memberships, and `/picker` as separate page (stories 2.6, 2.8). Epic 3 story 3.2 **supersedes picker presentation** — moves selection UI into dashboard picker mode. Auth APIs unchanged.

## Implementation note (2026-09-11)

Stories 3.1, 3.3, 3.4, 3.5 appear largely implemented in `app/` and `server/`. **Story 3.2 picker-in-dashboard migration and story 3.6 verification remain the primary open work.**
