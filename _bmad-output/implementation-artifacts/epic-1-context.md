# Epic 1 Context: Caz Agent email login, access gate, and HTML landing

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Remove `caz/` entirely. Login and post-login UI live in React `app/`. Auth and Postgres live in `server/`. Active users reach a Caz Agent dashboard; inactive users see mock Telegram and email to pay. A simple HTML landing in `landing/` links to the app.

## Stories

- Story 1.1: Remove caz entirely
- Story 1.2: Caz Agent login page in app
- Story 1.3: Postgres auth in server and mock seed
- Story 1.4: Route by isActive to dashboard or contact-to-pay
- Story 1.5: Simple HTML landing with link to the app

## Requirements & Constraints

- Product name and login/dashboard titles: Caz Agent. UI copy in `app/` is Russian.
- Login is a separate page in `app/` with email and password fields; dashboard and contact-to-pay are not shown until login succeeds.
- Telegram is not login or hosting (no Mini App, WebApp SDK, initData, bot-hosted entry). Showing a Telegram handle on the contact page is allowed.
- `caz/` is deleted completely — not frontend, not API.
- Auth/Postgres: `server/`. Product UI: `app/`. Public landing: `landing/` as plain HTML with a link to the app.

## Technical Decisions

- Frontend: existing Vite React app in `app/`.
- Backend: existing `server/` + Postgres.
- Landing: static HTML in `landing/`, not React in `app/`.

## UX & Interaction Patterns

- Four surfaces: HTML landing → React login → dashboard or contact-to-pay.
- Login: visible title Caz Agent plus email and password inputs.

## Cross-Story Dependencies

- 1.1 removes `caz/` before later stories treat it as gone.
- 1.2 ships the login form in `app/` before 1.3 attaches Postgres sessions.
- 1.4 depends on 1.3 sessions and `isActive`.
- 1.5 landing links to `app/`; it does not implement login.
