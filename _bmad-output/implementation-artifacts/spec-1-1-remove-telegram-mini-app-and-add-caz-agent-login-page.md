---
title: 'Remove Telegram Mini App and add Caz Agent login page'
type: 'feature'
created: '2026-09-11'
status: 'draft'
route: 'dispatch'
review_loop_iteration: 0
context:
  - `{project-root}/_bmad-output/specs/spec-telegram-miniapp-login/SPEC.md`
  - `{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md`
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Caz Agent still enters through Telegram Mini App (`initData`, WebApp SDK, paid/unpaid redirect). Product entry must be a website login page titled **Caz Agent** with email and password (CAP-4).

**Approach:** Remove Mini App hosting and Telegram verification from `caz/`. Make `/` a Russian login page with a visible **Caz Agent** title plus email and password fields. Do not show dashboard or contact-to-pay as authenticated views until login succeeds. Postgres auth is story 1.2.

## Boundaries & Constraints

**Always:**
- Work in existing Next.js app `caz/`.
- UI copy Russian; product name **Caz Agent** (login title and document title).
- Login is a separate page from dashboard and subscribe/contact-to-pay.
- Telegram is not login or app hosting: no WebApp script, no `initData` session API, no Mini App gate.

**Never:**
- Implement Postgres, hashed seed users, or `isActive` routing (stories 1.2 / 1.3).
- Telegram Login Widget, bot login, or in-app billing.
- Full post-login product chrome.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Open root | GET `/` in a normal browser | Login page: title Caz Agent, email field, password field | N/A |
| No Telegram | No WebApp `initData` | Still the login page; no Mini App reject copy | Do not require Telegram |
| Unauthenticated dashboard | GET `/dashboard` without a successful login | Not the authenticated Caz Agent dashboard | Redirect or equivalent so CAP-1 is not shown |
| Unauthenticated subscribe | GET `/subscribe` without a successful login | Not the authenticated paywall stub | Redirect or equivalent so CAP-2 is not shown |

</frozen-after-approval>

## Open Questions

- LOGIN_SUBMIT — options: A form is display-only this story (submit does not navigate or authenticate; user sees the same login page) / B submit shows a Russian error that credentials are not wired yet / C implement a fake client success that still must not open dashboard (conflicts with “login succeeds” and 1.2)
- DEEP_LINKS — options: A `/dashboard` and `/subscribe` redirect to `/` for everyone this story / B leave those routes but strip Telegram so they are empty/placeholder pages not titled as the authenticated dashboard / C delete `/subscribe` now and stub `/dashboard` until 1.3

## Code Map

- `caz/app/page.tsx` -- root currently renders `MiniAppGate`; replace with login page
- `caz/app/mini-app-gate.tsx` -- paid/unpaid Telegram router; remove
- `caz/app/mini-app-session.tsx` -- `initData` fetch to `/api/miniapp/session`; `Screen` layout reusable; `RejectedScreen` Telegram copy must go
- `caz/app/layout.tsx` -- loads `telegram.org/js/telegram-web-app.js`; metadata still “Caz agent Mini App”
- `caz/app/dashboard/page.tsx` -- uses `useMiniAppSession`; must not remain a Telegram-gated dashboard
- `caz/app/subscribe/page.tsx` -- same session hook; unpaid stub
- `caz/app/api/miniapp/session/route.ts` -- verifies Telegram `initData` + env paid flag; delete
- `caz/lib/telegram-init-data.ts` and `caz/lib/telegram-init-data.test.ts` -- HMAC verify; delete; drop tsconfig exclude for the test
- `caz/types/telegram-web-app.d.ts` -- `window.Telegram`; delete
- `caz/.env.example` -- `TELEGRAM_BOT_TOKEN`, `CAZ_SUBSCRIPTION_PAID`; strip Telegram/env-stub vars

Do not change Next/React versions or unrelated `.next` artifacts.

## Tasks & Acceptance

**Execution:**
- [ ] `caz/app/page.tsx` -- render Caz Agent login (title, email, password) -- CAP-4 entry
- [ ] `caz/app/layout.tsx` -- drop Telegram script; metadata Caz Agent -- no Mini App host
- [ ] `caz/app/mini-app-gate.tsx` `caz/app/mini-app-session.tsx` `caz/app/api/miniapp/session/route.ts` `caz/lib/telegram-init-data.ts` `caz/lib/telegram-init-data.test.ts` `caz/types/telegram-web-app.d.ts` -- remove Mini App stack -- constraint
- [ ] `caz/app/dashboard/page.tsx` `caz/app/subscribe/page.tsx` -- stop Telegram session; apply DEEP_LINKS decision -- CAP-1/2 not shown pre-login
- [ ] `caz/.env.example` `caz/tsconfig.json` -- remove bot token / paid env and test exclude -- no Telegram config
- [ ] Unit or route-level check of I/O matrix (login visible; Telegram verify gone) -- matrix coverage

**Acceptance Criteria:**
- Given a browser with no Telegram WebApp, when opening `/`, then a login page titled Caz Agent with email and password fields is shown and Mini App reject copy is not.
- Given no successful login, when requesting dashboard or subscribe, then those authenticated stub screens are not shown.
- Given the repo after this story, when searching for Telegram WebApp script, `initData` session API, or `verifyTelegramInitData`, then they are gone from `caz/` source.

## Implementation Notes

## Spec Change Log

## Review Triage Log
