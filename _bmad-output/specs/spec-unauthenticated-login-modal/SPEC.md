---
id: SPEC-unauthenticated-login-modal
companions:
  - unauthenticated-modal.md
  - ../spec-app-english-only/conventions.md
  - ../spec-caz-agent-ui-improvement/design-tokens.md
  - ../spec-caz-agent-ui-improvement/components.md
  - ../spec-streaming-oauth-auth/SPEC.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability only.

# Caz Agent — Unauthenticated login modal

## Why

**Pain:** When the server rejects a request with `Not authenticated` (401), operators may only see a generic error or get silently redirected to `/` without explanation. That hides why an action failed and does not offer a clear path back to Kick login.

**Who:** Dashboard operators (owners and moderators) using protected routes under `AppShell`.

## Capabilities

- **CAP-1**
  - **intent:** An operator on protected app routes sees a clear sign-in-required modal when the session is not authenticated.
  - **success:** Deep-link to a protected path with no session shows the modal instead of silent redirect; 401 with message `Not authenticated` from a protected API shows the same modal; title **Sign in required**; no raw `Not authenticated` toast as sole feedback.

- **CAP-2**
  - **intent:** An operator can open the login page from the modal in one action.
  - **success:** Primary button **Go to login** navigates to `/` with no query string; login page renders `LoginPage` with existing Kick OAuth; post-login follows existing default landing only (no return URL).

- **CAP-3**
  - **intent:** Unauthenticated handling is consistent across protected API usage in the dashboard app.
  - **success:** At least prize-spin, bonus-buy, chat-roll, team, and kick-channel protected fetches route 401 `Not authenticated` through the same global handler; second concurrent 401 does not open a second dialog; public widget routes under `/modules/*/widget` never show the modal.

## Constraints

- English copy only per `spec-app-english-only`; strings listed in `unauthenticated-modal.md`.
- MUI dialog layout consistent with existing module confirmation dialogs (e.g. `PrizeSpinArchiveDialog`).
- Login destination is `/` with **no** `?next=` or deep-link return parameter.
- `ProtectedRoute` must not use `<Navigate to="/" replace />` for missing user — use the global modal per `unauthenticated-modal.md`.
- OAuth behavior unchanged per adopted `spec-streaming-oauth-auth`.
- No modal on `/` (guest login route) to avoid redirect loops.
- Public OBS widget pages remain outside auth — no change to unauthenticated widget loads.

## Non-goals

- Changing Kick OAuth or moderator access-link flows.
- Adding locale/i18n or Russian copy for this dialog.
- Showing the modal on public stream widget URLs.
- Post-login redirect to the URL the user attempted before sign-in.
- Replacing all 401 handling for non–`Not authenticated` messages (e.g. wrong account scope) in this slice unless they share the same handler by accident.

## Success signal

Unauthenticated user opens `/modules/prize-spin` directly → **Sign in required** modal appears (no instant redirect) → **Go to login** lands on `/` without query params → Sign in with Kick → default dashboard entry → expired session on protected API shows the same modal → `npm run build` in `app/` passes.

## Assumptions

- Requirement applies app-wide on protected dashboard surfaces, not a single component.
- Server continues to emit `Not authenticated` on missing session for guarded endpoints (`auth.service.ts` pattern).
- Primary CTA navigates to `/`; direct OAuth from the modal is out of scope.
