---
id: SPEC-caz-team-dashboard
companions:
  - nav-shell.md
  - surfaces.md
  - modules-catalog.md
  - mock-stats.md
  - members-api.md
  - ../spec-caz-agent-ui-improvement/design-tokens.md
  - ../spec-caz-agent-ui-improvement/components.md
  - ../spec-user-account-model/SPEC.md
  - ../spec-app-english-only/SPEC.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for audit only — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Caz Agent — Team dashboard and modules hub

## Why

**Pain:** After login, operators land on an MVP card with a single add-moderator form — no product home, no sense of what the team can use, and no path toward streamer tooling. Moderator management on the home page clutters the overview.

**Opportunity:** Make `/dashboard` the **team home** — team metadata and mocked stats as a value preview — wrapped in a **persistent nav shell** with a dedicated **`/team`** page for member and moderator access management, plus **`/modules`** as a focused catalog of streamer modules (Bonus Buy live, Wheel of Fortune preview). Inline team picker when the user has multiple memberships. This slice lays product chrome without shipping full game runtime or real analytics.

**Who:** Owner and moderator of an active Caz Agent team (English UI, dark shadcn).

## Capabilities

- **CAP-1**
  - **intent:** An operator sees a summary card for the active team — name, their role, and subscription status.
  - **success:** On `/dashboard` home mode, `accountName`, `role`, and a badge (`Active` / `Inactive`) render from session/`/auth/me` and match `accountIsActive`.

- **CAP-2**
  - **intent:** An operator with multiple team memberships can switch the active team without logging out.
  - **success:** **Switch team** clears account context and `/dashboard` enters **picker mode** (membership cards); after `select-account`, home mode shows updated team metadata.

- **CAP-3**
  - **intent:** An owner lists, adds, and deactivates moderators by name; a moderator lists and revokes moderator access but cannot add moderators — all on a dedicated team page.
  - **success:** On `/team`, `GET /accounts/:accountId/members` populates the roster; owner sees add-by-name form plus revoke controls; moderator sees roster and revoke controls only; `POST .../moderators` rejects non-owners; `PATCH .../members/:id` accepts owner or moderator for `role=moderator` rows.

- **CAP-4**
  - **intent:** An operator works inside a persistent app shell on dashboard, team, and modules routes with clear navigation.
  - **success:** `/dashboard` (home or picker mode), `/team`, and `/modules` share `nav-shell.md` layout; **Home**, **Team**, and **Modules** are active links when account is selected; future nav slots are visible but disabled; logout is reachable from the shell; layout is not a centered single-card MVP.

- **CAP-5**
  - **intent:** An operator sees mocked team statistics on the dashboard home as a preview of future analytics.
  - **success:** Four stat cards from `mock-stats.md` render with static demo numbers and a muted demo-data hint; no stats API is called. Hidden in picker mode.

- **CAP-6**
  - **intent:** An operator sees the streamer module catalog on a dedicated modules page — Bonus Buy available now and Wheel of Fortune as a coming-soon preview.
  - **success:** `/modules` renders exactly two cards from `modules-catalog.md`: **Bonus Buy** shows **Available** badge and **Open** navigates to `/bonus-buy`; **Wheel of Fortune** shows **Soon** badge, muted card, and **Coming soon** chip with no navigation or toggle; no other module cards appear.

- **CAP-7**
  - **intent:** The dashboard is the landing surface after login and hosts team selection when multiple memberships exist.
  - **success:** Post-login orchestration routes 2+ memberships to `/dashboard` **picker mode** (not `/picker`); single active account still lands on home mode; active `select-account` → home mode or contact-to-pay per user-account-model; pages use shadcn tokens from adopted UI spec companions.

- **CAP-9**
  - **intent:** An operator navigates to a dedicated team page from the sidebar to view members and manage moderator access.
  - **success:** `/team` shows H1 **Team**, member roster, and role-appropriate moderator controls per `surfaces.md`; `/dashboard` home has no moderator roster or add-moderator form; sidebar **Team** is active on `/team` and disabled in picker mode until account is selected.

## Constraints

- **UI stack (project-wide):** shadcn/ui on `@radix-ui/*`, dark-only, **English copy** per adopted `spec-app-english-only` and `design-tokens.md` / `components.md`; all `/dashboard`, `/team`, and `/modules` surfaces use Radix-backed shadcn components (e.g. `Dialog` on `/team`), not bespoke overlays or alternate libraries.
- **Role labels:** display **Moderator** not Admin per adopted `spec-app-english-only`.
- **Three live shell routes:** `/dashboard` (home or picker mode), `/team` (members and moderator access), `/modules` (two-card catalog); layout contract in `nav-shell.md` and `surfaces.md`.
- **No `/picker` route:** team selection UI lives only on `/dashboard` picker mode; remove standalone `AccountPickerPage` route.
- **Role matrix:** owner — add moderator (`POST /moderators`) + revoke moderator; moderator — revoke moderator, **no** add moderator. Module catalog is view-only for both roles in this slice (Bonus Buy **Open**, Wheel of Fortune non-interactive).
- **New API:** `GET /accounts/:accountId/members` — contract in `members-api.md`; caller must be an active member of the account.
- **Mock persistence:** dashboard stats use client-side mock data only; no Postgres tables for modules or metrics in this slice.
- **Nav placeholders:** future items (round history, stream settings) render disabled with **Soon** — no dead routes.
- **Auth API unchanged:** `select-account`, membership checks, onboarding, and contact-to-pay routing logic per `spec-user-account-model`; only picker **presentation** moves into dashboard.
- **Team nav gating:** **Team** and **Modules** disabled in picker mode until account is selected.
- **Module catalog scope:** only `bonus-buy` and `wheel-of-fortune` rows from `modules-catalog.md`; retired rows (`casino-stream-games`, `obs-overlay`, `round-history`, `kick-integration`) must not render.
- **No connected-modules banner:** `/modules` shows `PageHeader` and the two-card grid only — no summary banner, toggle count, or «modules connected» strip.

## Non-goals

- Real analytics pipeline or stats API.
- Postgres persistence for enabled modules or module toggles on `/modules`.
- CasinoStream games runtime, OBS overlay, Kick integration, or mock game grids on `/modules`.
- Wheel of Fortune implementation beyond a **Soon** catalog card.
- Billing UI, team rename, or invite-by-email flows.
- Light mode or theme toggle.
- Moderator adding other moderators.
- Standalone `/picker` page or route.
- Moderator management UI on `/dashboard` home (moved to `/team`).
- Legacy `admin` role values, `/admins` API paths, or Admin UI labels.

## Success signal

An owner with two teams logs in → `/dashboard` picker mode → selects team → home shows team card and four mock stat cards **without** moderator roster → sidebar **Team** → roster with add + revoke → sidebar **Modules** → exactly two cards (**Bonus Buy** with **Open**, **Wheel of Fortune** with **Soon**) → **Open** lands on `/bonus-buy` → **Switch team** → picker mode → other team → updated home → logs out. A moderator logs in → picker or home as applicable → `/team` with roster and revoke **without** add-moderator form → role badge shows **Moderator** → `npm run build` in `app/` passes; no `/picker` route remains; no mock games section on `/modules`.

## Assumptions

- Deactivate moderator via PATCH is allowed for both owner and moderator (existing owner-only check in server must be extended for moderator callers on moderator rows only).
- Stat card copy and numbers from `mock-stats.md` are placeholders, not product commitments.
- Disabled nav slots use labels **History** and **Settings** until product names are fixed.
- Deactivated moderators remain in the roster with an inactive badge and reactivate control.
- Picker mode reuses membership card pattern from adopted UI spec (`Card` + `Badge` + `Button` per row).
- `modules_active` stat on dashboard may read `0` while the catalog has no toggleable modules — acceptable until toggle modules return.
