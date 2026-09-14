---
id: SPEC-telegram-miniapp-login
companions:
  - mock-data.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Caz Agent — email login, Postgres-backed access gate

## Why

**Pain + mandate:** **Caz Agent** must stop using Telegram as the product surface and must **remove `caz/` entirely**. Operators sign in with email and password against Postgres via **`server/`**. Access is `isActive`: active users reach the dashboard; others contact a person via **Telegram and email** to pay. The authenticated product UI is React in **`app/`**. A public **simple HTML landing** in **`landing/`** presents the project for search crawlers and links into the app. This slice uses **mock users and mock contact** until live data exists.

## Capabilities

- **CAP-1**
  - **intent:** A logged-in user whose Postgres record has `isActive` true sees a dashboard page titled **Caz Agent**, in Russian.
  - **success:** After login as the mock active user in `mock-data.md`, the app shows a distinct dashboard titled **Caz Agent** and does not show the contact-to-pay page.

- **CAP-2**
  - **intent:** A logged-in user who does not have `isActive` (false or unset) is asked in Russian to contact a person via **Telegram and email** to pay for access and cannot reach the dashboard.
  - **success:** After login as the mock inactive user in `mock-data.md`, the page shows both mock Telegram and mock email from that companion and does not show the dashboard titled **Caz Agent**.

- **CAP-3** *(retired)* Telegram Mini App `initData` session required to see CAP-1 or CAP-2. Do not reuse this ID.

- **CAP-4**
  - **intent:** A visitor can use a login page titled **Caz Agent** with fields to enter email and password; they must complete login before CAP-1 or CAP-2.
  - **success:** The login route shows title **Caz Agent** plus email and password inputs; it is not the dashboard; CAP-1/CAP-2 screens are not shown until login succeeds.

- **CAP-5**
  - **intent:** A user can authenticate with email and password stored and checked by a backend connected to **Postgres**.
  - **success:** Mock credentials in `mock-data.md` that match a seeded Postgres user create a session via **`server/`**; other credentials do not open the dashboard or the contact-to-pay page as a logged-in user.

- **CAP-6**
  - **intent:** A visitor can open a simple public page that presents the project and reach the application from it without signing in on that page.
  - **success:** **`landing/`** serves static HTML (content in the document, not only after client JS) with a **working link to the Caz Agent app** (`app/`). It is not the React login, dashboard, or contact-to-pay screens.

## Constraints

- **Telegram is not login or app hosting:** not a Mini App, not WebApp SDK, not `initData`, not a bot-hosted entry. Showing a Telegram contact on CAP-2 is allowed.
- Authenticated product UI is the **React app `app/`**. Login, dashboard, and contact-to-pay are **separate pages/routes** there.
- Auth and Postgres access are implemented in **`server/`**, not in `app/`, not in `landing/`, not in `caz/`.
- Public landing is **`landing/`**, **plain HTML**, **one simple page**, and **must include a link to the application**.
- **`caz/` is removed completely**.
- Database engine is **Postgres**.
- Access after login is the **`isActive` flag in Postgres**, not an environment-variable stub.
- This slice **seeds mock data** (`mock-data.md`); live customer rows and production contact are not required yet.
- This slice does **not** provide self-serve payment; inactive users must be given **both Telegram and email** (mock values in `mock-data.md`).
- Product UI copy in `app/` is **Russian**; login/dashboard titles are **Caz Agent**.
- The **login page must have a visible title** and **email and password** input fields.
- Owner and admin both use the app; this slice does not issue invites or split UI by role.

## Non-goals

- Admin invite issuance and role management
- Kick overlay, chat games, or a real streamer dashboard
- Telegram Mini App, Telegram WebApp SDK, `initData`, Telegram Login Widget, or bot-based login
- Keeping or extending **`caz/`** in any form
- Building the landing as React inside **`app/`**
- A rich marketing site (long copy, campaigns, extra landing routes)
- Live in-app billing
- Production contact details or real customer import
- Full post-login product chrome beyond login, dashboard, and contact-to-pay

## Success signal

On **Caz Agent** in **`app/`**, login against **`server/`** with mock users from `mock-data.md`: active → Russian dashboard titled **Caz Agent**; inactive → mock Telegram `@caz_agent_mock` and email `pay@caz-agent.example`. Invalid credentials fail the gate. **`landing/`** is a simple crawler-readable HTML page **with a link to the app**. **`caz/` is gone.**

## Assumptions

- `app/` is the Vite + React 19 project already in the repo.
- `server/` is the existing backend that owns Postgres and CAP-5.
- `landing/` is the intended tree for CAP-6 even if the folder is not present yet.
- The landing link targets the React app in `app/`; production hostname is not specified this slice.
- Owner and admin share the same post-login screens in this slice.
- Missing or null `isActive` is treated the same as false (contact-to-pay).
- Mock passwords in `mock-data.md` are seed secrets; Postgres stores hashes.
