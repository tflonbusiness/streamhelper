# Caz Agent login — implementation breakdown

Source: `_bmad-output/specs/spec-telegram-miniapp-login/SPEC.md`, `stories.yaml`, `mock-data.md`.

## Epic 1: Caz Agent email login, access gate, and HTML landing

Remove `caz/` entirely. Login and post-login UI live in React `app/`. Auth and Postgres live in `server/`. Active users reach the dashboard; inactive users see mock Telegram and email to pay. A simple HTML landing in `landing/` links to the app.

### Story 1.1: Remove caz entirely

Delete the `caz/` project from the repo and product surface. Telegram Mini App and Next.js UI in `caz` are not the shipped app.

**Acceptance Criteria:**

**Given** the repository after this story
**When** a reviewer looks for the product frontend or Mini App
**Then** the `caz/` tree is gone
**And** Telegram Mini App SDK, initData verification, and bot-hosted entry are not the product surface
**And** shipped UI is not Next.js pages under `caz/`

### Story 1.2: Caz Agent login page in app

In the React app at `app/`, ship a separate login page titled Caz Agent with email and password fields (CAP-4). Dashboard and contact-to-pay are not shown until login succeeds.

**Acceptance Criteria:**

**Given** a visitor opens `app/`
**When** they land on the login route
**Then** they see title Caz Agent plus email and password inputs
**And** the login page is not the dashboard
**And** CAP-1/CAP-2 screens are not shown until login succeeds
**And** this UI is implemented in `app/`, not in `caz/` or `landing/`

### Story 1.3: Postgres auth in server and mock seed

In `server/`, connect to Postgres and seed hashed mock users from `mock-data.md` (CAP-5). Matching credentials create a session; unknown or wrong credentials do not grant a logged-in dashboard or contact-to-pay view.

**Acceptance Criteria:**

**Given** Postgres is seeded from `mock-data.md` with hashed passwords
**When** a visitor submits `active@caz-agent.example` / `password-active` or `inactive@caz-agent.example` / `password-inactive`
**Then** `server/` creates an authenticated session
**And** wrong or unknown credentials do not open dashboard or contact-to-pay as a logged-in user
**And** the database engine is Postgres
**And** auth is not implemented in `app/` or `landing/`

### Story 1.4: Route by isActive to dashboard or contact-to-pay

After a session in `app/`, `isActive` true opens the Russian dashboard titled Caz Agent (CAP-1); false or unset opens a page with mock Telegram and email from `mock-data.md` and blocks the dashboard (CAP-2).

**Acceptance Criteria:**

**Given** a successful login as the mock active user
**When** they complete authentication
**Then** they see a distinct Russian dashboard titled Caz Agent
**And** they do not see the contact-to-pay page

**Given** a successful login as the mock inactive user
**When** they complete authentication
**Then** they see a Russian page with Telegram `@caz_agent_mock` and email `pay@caz-agent.example`
**And** they do not see the dashboard titled Caz Agent

### Story 1.5: Simple HTML landing with link to the app

In `landing/`, ship one static HTML page that presents the project and links to the Caz Agent app in `app/` (CAP-6). It is not the React login, dashboard, or contact-to-pay screens.

**Acceptance Criteria:**

**Given** a visitor opens the landing
**When** they view the page without signing in
**Then** they get a simple HTML document whose content is in the markup (not only after client JS)
**And** the page includes a working link to the Caz Agent app (`app/`)
**And** the page is not the React login, dashboard, or contact-to-pay screens
**And** the landing is not built as React inside `app/`
