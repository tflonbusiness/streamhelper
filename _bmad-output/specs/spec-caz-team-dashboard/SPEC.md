---
id: SPEC-caz-team-dashboard
companions:
  - nav-shell.md
  - surfaces.md
  - modules-catalog.md
  - games-mock.md
  - mock-stats.md
  - members-api.md
  - ../spec-caz-agent-ui-improvement/design-tokens.md
  - ../spec-caz-agent-ui-improvement/components.md
  - ../spec-user-account-model/SPEC.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Caz Agent — Team dashboard and modules hub

## Why

**Pain:** After login, operators land on an MVP card with a single add-admin form — no product home, no sense of what the team can use, and no path toward streamer tooling. Admin management on the home page clutters the overview.

**Opportunity:** Make `/dashboard` the **team home** — team metadata and mocked stats as a value preview — wrapped in a **persistent nav shell** with a dedicated **`/team`** page for member and admin access management, plus **`/modules`** for streamer product modules. Inline team picker when the user has multiple memberships. This slice lays product chrome without shipping CasinoStream runtime or real analytics.

**Who:** Owner and admin of an active Caz Agent team (Russian UI, dark shadcn).

## Capabilities

- **CAP-1**
  - **intent:** An operator sees a summary card for the active team — name, their role, and subscription status.
  - **success:** On `/dashboard` home mode, `accountName`, `role`, and a badge (`активна` / `неактивна`) render from session/`/auth/me` and match `accountIsActive`.

- **CAP-2**
  - **intent:** An operator with multiple team memberships can switch the active team without logging out.
  - **success:** «Сменить команду» clears account context and `/dashboard` enters **picker mode** (membership cards); after `select-account`, home mode shows updated team metadata.

- **CAP-3**
  - **intent:** An owner lists, adds, and deactivates admins by name; an admin lists and revokes admin access but cannot add admins — all on a dedicated team page.
  - **success:** On `/team`, `GET /accounts/:accountId/members` populates the roster; owner sees add-by-name form plus revoke controls; admin sees roster and revoke controls only; `POST .../members` rejects non-owners; `PATCH .../members/:id` accepts owner or admin for `role=admin` rows.

- **CAP-4**
  - **intent:** An operator works inside a persistent app shell on dashboard, team, and modules routes with clear navigation.
  - **success:** `/dashboard` (home or picker mode), `/team`, and `/modules` share `nav-shell.md` layout; «Главная», «Команда», and «Модули» are active links when account is selected; future nav slots are visible but disabled; logout is reachable from the shell; layout is not a centered single-card MVP.

- **CAP-5**
  - **intent:** An operator sees mocked team statistics on the dashboard home as a preview of future analytics.
  - **success:** Four stat cards from `mock-stats.md` render with static demo numbers and a muted «демо-данные» hint; no stats API is called. Hidden in picker mode.

- **CAP-6**
  - **intent:** An owner or admin enables or disables streamer modules for the team on a dedicated modules page.
  - **success:** `/modules` lists cards from `modules-catalog.md`; «доступен» modules toggle «подключён» state stored in `localStorage` key `caz-modules-{accountId}`; «скоро» modules are non-interactive; both owner and admin can toggle; changes survive page reload in the same browser.

- **CAP-7**
  - **intent:** The dashboard is the landing surface after login and hosts team selection when multiple memberships exist.
  - **success:** Post-login orchestration routes 2+ memberships to `/dashboard` **picker mode** (not `/picker`); single active account still lands on home mode; active `select-account` → home mode or contact-to-pay per user-account-model; pages use shadcn tokens from adopted UI spec companions.

- **CAP-8**
  - **intent:** An operator with the games module enabled sees a grid of mock game cards showing game names only.
  - **success:** On `/modules`, when `casino-stream-games` is toggled on, eight name cards from `games-mock.md` render in an «Игры» section; toggling module off hides the section; cards have no launch or settings actions.

- **CAP-9**
  - **intent:** An operator navigates to a dedicated team page from the sidebar to view members and manage admin access.
  - **success:** `/team` shows H1 «Команда», member roster, and role-appropriate admin controls per `surfaces.md`; `/dashboard` home has no admin roster or add-admin form; sidebar «Команда» is active on `/team` and disabled in picker mode until account is selected.

## Constraints

- **UI stack (project-wide):** shadcn/ui on `@radix-ui/*`, dark-only, Russian copy, Caz Agent branding — per adopted `design-tokens.md` and `components.md`; all `/dashboard`, `/team`, and `/modules` surfaces use Radix-backed shadcn components (e.g. `Dialog` on `/team`, `Switch` on `/modules`), not bespoke overlays or alternate libraries.
- **Three live shell routes:** `/dashboard` (home or picker mode), `/team` (members and admin access), `/modules` (catalog); layout contract in `nav-shell.md` and `surfaces.md`.
- **No `/picker` route:** team selection UI lives only on `/dashboard` picker mode; remove standalone `AccountPickerPage` route.
- **Role matrix:** owner — add admin (`POST`) + revoke admin + toggle modules; admin — revoke admin + toggle modules, **no** add admin.
- **New API:** `GET /accounts/:accountId/members` — contract in `members-api.md`; caller must be an active member of the account.
- **Mock persistence:** module toggles and stats use client-side mock data only; no Postgres tables for modules or metrics in this slice.
- **Nav placeholders:** future items (round history, stream settings) render disabled with «скоро» — no dead routes.
- **Auth API unchanged:** `select-account`, membership checks, onboarding, and contact-to-pay routing logic per `spec-user-account-model`; only picker **presentation** moves into dashboard.
- **Team nav gating:** «Команда» and «Модули» disabled in picker mode until account is selected.

## Non-goals

- Real analytics pipeline or stats API.
- Postgres persistence for enabled modules.
- CasinoStream game runtime, OBS overlay, or Kick integration.
- Billing UI, team rename, or invite-by-email flows.
- Light mode or theme toggle.
- Admin adding other admins.
- Standalone `/picker` page or route.
- Admin management UI on `/dashboard` home (moved to `/team`).

## Success signal

An owner with two teams logs in → `/dashboard` picker mode → selects team → home shows team card and four mock stat cards **without** admin roster → sidebar «Команда» → roster with add + revoke → sidebar «Модули» → toggles «CasinoStream — игры» on → eight mock game name cards appear → «Сменить команду» → picker mode → other team → updated home → reload preserves module toggle → logs out. An admin logs in → picker or home as applicable → `/team` with roster and revoke **without** add-admin form → `npm run build` in `app/` passes; no `/picker` route remains.

## Assumptions

- Module enabled state in `localStorage` is acceptable until a backend module table exists.
- Deactivate admin via PATCH is allowed for both owner and admin (existing owner-only check in server must be extended for admin callers on admin rows only).
- Stat card copy and numbers from `mock-stats.md` are placeholders, not product commitments.
- Disabled nav slots use labels «История» and «Настройки» until product names are fixed.
- Deactivated admins remain in the roster with an inactive badge and reactivate control.
- Picker mode reuses membership card pattern from adopted UI spec (`Card` + `Badge` + `Button` per row).
