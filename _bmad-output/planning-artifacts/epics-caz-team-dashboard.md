# Caz Agent team dashboard and modules hub — implementation breakdown

Source: `_bmad-output/specs/spec-caz-team-dashboard/SPEC.md`, companions (`nav-shell.md`, `surfaces.md`, `modules-catalog.md`, `mock-stats.md`, `games-mock.md`, `members-api.md`).

Depends on: Epic 2 (accounts, memberships, post-login routing, select-account session).

## Epic 3: Team dashboard and modules hub

Turn `/dashboard` into the team home — summary card, mock stats preview, admin roster, and **inline team picker** when the user has multiple memberships. Wrap dashboard and `/modules` in a persistent nav shell. Module catalog toggles persist in `localStorage` until a backend exists. No real analytics or CasinoStream runtime in this epic.

### Story 3.1: GET members API and admin PATCH authorization

Add `GET /accounts/:accountId/members` and extend `PATCH` member authorization so active admins can deactivate/reactivate admin rows (CAP-3). Contract in `members-api.md`; owner-only `POST` unchanged.

**Acceptance Criteria:**

**Given** an active owner or admin session on account `:accountId`
**When** GET `/accounts/:accountId/members`
**Then** response lists owner and admin rows with `userId`, `email`, `role`, `isActive` ordered owner first

**Given** a user who is not an active member of the account
**When** GET members
**Then** request is rejected with 403

**Given** an active admin caller and target row with `role=admin`
**When** PATCH `{ isActive: false }`
**Then** membership toggles and roster reflects change

**Given** admin caller and target row with `role=owner`
**When** PATCH is attempted
**Then** request is rejected

### Story 3.2: App shell, routing, and inline team picker

Implement `AppShell` per `nav-shell.md` with nested routes for `/dashboard` and `/modules`. **Embed team picker in `/dashboard` picker mode** — remove standalone `/picker` route (CAP-2, CAP-4, CAP-7). Post-login with 2+ memberships routes to `/dashboard` picker mode, not `/picker`.

**Acceptance Criteria:**

**Given** authenticated user with 2+ active memberships and no `accountId` in session
**When** post-login router runs
**Then** user lands on `/dashboard` picker mode inside the app shell
**And** `/picker` route does not exist or redirects to `/dashboard`

**Given** picker mode on `/dashboard`
**Then** membership cards show name, role badge, and «Войти» button
**And** team card, stats, and admin roster are hidden
**And** «Модули» nav is disabled until account is selected

**Given** user with selected active account
**When** they click «Сменить команду»
**Then** session account context clears and `/dashboard` returns to picker mode
**And** after `select-account` home mode renders with updated team metadata

**Given** selected active account
**When** user navigates shell routes
**Then** `/dashboard` and `/modules` share sidebar, top bar, logout, and disabled «скоро» placeholders

### Story 3.3: Dashboard home — team card, mock stats, admin roster

Build dashboard **home mode** with team summary card, four mock stat cards from `mock-stats.md`, and admin roster wired to GET members (CAP-1, CAP-5, CAP-3 UI). Owner sees add-by-email form; admin does not.

**Acceptance Criteria:**

**Given** active account on `/dashboard` home mode
**Then** team name, role badge, and subscription badge (`активна` / `неактивна`) match session

**Given** home mode
**Then** four stat cards from `mock-stats.md` render with «Демо-данные для предпросмотра» hint
**And** no stats API is called

**Given** owner session
**Then** admin roster loads from GET members with add-by-email form and deactivate/reactivate controls

**Given** admin session
**Then** roster and deactivate/reactivate controls render without add-admin form

**Given** deactivated admin row
**Then** row stays visible with badge «Неактивен» and reactivate action

### Story 3.4: Modules page with catalog toggles

Build `/modules` listing module cards from `modules-catalog.md` with `localStorage` persistence `caz-modules-{accountId}` (CAP-6). Owner and admin can toggle available modules; «скоро» modules are non-interactive.

**Acceptance Criteria:**

**Given** active account on `/modules`
**Then** module cards render name, description, and status badge per catalog

**Given** module with status `available`
**When** owner or admin toggles «Подключить» / «Отключить»
**Then** enabled ids persist in `localStorage` for that `accountId`
**And** reload preserves toggle state

**Given** module with status `coming_soon`
**Then** card shows «Скоро» and has no interactive toggle

### Story 3.5: Mock game cards when games module enabled

When `casino-stream-games` is toggled on, show eight static game name cards in an «Игры» section on `/modules` per `games-mock.md` (CAP-8).

**Acceptance Criteria:**

**Given** `casino-stream-games` enabled for the account
**When** user opens `/modules`
**Then** «Игры» section shows eight name-only cards from `games-mock.md`
**And** hint reads «Запуск игр будет доступен позже»

**Given** module toggled off
**Then** «Игры» section is hidden
**And** cards have no launch or settings actions

### Story 3.6: Integration smoke and build verification

Verify owner and admin flows end-to-end including picker-in-dashboard, inactive admin roster display, and `npm run build` in `app/`.

**Acceptance Criteria:**

**Given** owner with two teams
**When** login → picker mode → select team → dashboard home → modules → toggle games
**Then** mock game cards appear and module toggle survives reload

**Given** owner on dashboard home
**When** «Сменить команду» → pick other team
**Then** home content updates to the other team without logout

**Given** admin session
**Then** modules page has full toggles and roster without add-admin form

**Given** `app/` workspace
**When** `npm run build` runs
**Then** build passes with no `/picker` route in the router
