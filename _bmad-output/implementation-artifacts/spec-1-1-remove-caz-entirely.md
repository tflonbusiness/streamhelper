---
title: 'Remove caz entirely'
type: 'chore'
created: '2026-09-11'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'NO_VCS'
context:
  - `{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md`
  - `{project-root}/_bmad-output/planning-artifacts/epics-caz-agent-login.md`
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Next.js Telegram Mini App in `caz/` is still on disk. Product UI must live in React `app/` and auth in `server/`; `caz/` is not a shipped surface.

**Approach:** Delete the entire `caz/` tree so Mini App SDK, initData verification, and Next.js pages under `caz/` are gone. Do not add login, dashboard, or landing in this story.

## Boundaries & Constraints

**Always:**
- Remove `caz/` completely (source, `node_modules`, `.next`, nested `.git`, config).
- Leave `app/` and `server/` product code unchanged.
- Leave BMAD planning/spec history that mentions `caz/` as historical text (do not rewrite SPEC.md, stories.yaml, or epic-1-context.md).

**Never:**
- Implement Caz Agent login, Postgres auth, isActive routing, or `landing/` (stories 1.2–1.5).
- Keep a stub `caz/` folder or move Mini App code into `app/` or `server/`.
- Follow `_bmad-output/implementation-artifacts/spec-1-1-remove-telegram-mini-app-and-add-caz-agent-login-page.md` (obsolete: it keeps `caz/` and adds login there).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Tree gone | Workspace after this story | No `caz/` directory | If delete fails, stop; do not leave a partial tree as “done” |
| Mini App gone | Search product source (`caz/`, `app/`, `server/`) | No Telegram WebApp script, `initData` session API, or `verifyTelegramInitData` | Ignore mentions inside `_bmad-output/` history |
| Other apps intact | `app/` and `server/` | Existing Vite React app and server still present | Do not delete them |

</frozen-after-approval>

## Code Map

- `caz/` — Next.js 16 Mini App (`package.json` name `caz`). Nested git repo. Entry: `caz/app/page.tsx` → `MiniAppGate`. Delete whole tree.
- `caz/app/layout.tsx` — loads `telegram.org/js/telegram-web-app.js`
- `caz/app/mini-app-gate.tsx`, `caz/app/mini-app-session.tsx`, `caz/app/api/miniapp/session/route.ts` — Telegram session + paid/unpaid routing
- `caz/lib/telegram-init-data.ts` — `verifyTelegramInitData`; tests beside it
- `caz/types/telegram-web-app.d.ts`, `caz/.env.example` — `window.Telegram`, `TELEGRAM_BOT_TOKEN`
- `app/` — Vite React 19 product UI; no imports of `caz/`. Do not change.
- `server/` — auth target for later stories; no `caz` references. Do not change.
- Parent workspace has no `.git`; `caz/.git` is only VCS for that tree.

## Tasks & Acceptance

**Execution:**
- [x] `caz/` — delete the directory recursively (including nested `.git`, `.next`, `node_modules`) — product surface gone
- [x] workspace root — confirm `app/` and `server/` still exist and `caz/` does not — no collateral delete

**Acceptance Criteria:**
- Given the repository after this story, when a reviewer looks for the product frontend or Mini App, then the `caz/` tree is gone
- And Telegram Mini App SDK, initData verification, and bot-hosted entry are not the product surface
- And shipped UI is not Next.js pages under `caz/`

## Implementation Notes

- Deleted the entire `caz/` tree (source, `node_modules`, `.next`, nested `.git`).
- `app/` and `server/` unchanged. BMAD history mentioning `caz/` left as-is.
- Verified: `test ! -e caz && test -d app && test -d server` exit 0; no Mini App SDK / `initData` / `verifyTelegramInitData` in `app/` or `server/` product source (excluding `node_modules`).
## Spec Change Log

## Review Triage Log

- `false` — Blind hunter: prose stub is not a recursive tree delete. Parent workspace has no git (`NO_VCS`); `caz/` is absent on disk, so missing per-file hunks are an artifact of the review input, not leftover Mini App files.
- `false` — Blind hunter: `node_modules/`, `.next/`, nested `.git/` uncheckable from the stub. Those paths lived only under `caz/`; `test ! -e caz` is true.
- `false` — Blind hunter: stub does not prove `app/` and `server/` intact. Direct listing: both directories still exist.
- `false` — Blind hunter: leftover docs/CI/imports pointing at `caz/` or Telegram Mini App. Search of workspace product trees (excluding `_bmad-output` and `node_modules`) found none.
- `false` — Blind hunter: missing spec/epic/login follow-through. Frozen intent forbids rewriting BMAD history and forbids stories 1.2–1.5 in this change.
- `false` — Blind hunter: no hashes/file counts so a partial delete could hide. `caz/` path does not exist; partial tree under that name is not possible.
## Verification

**Commands:**
- `test ! -e caz && test -d app && test -d server` — expected: exit 0
- `rg -l 'telegram-web-app|verifyTelegramInitData|initData' app server caz` — expected: no matches (or `caz` path missing)

**Manual checks (if no CLI):**
- Workspace listing shows `app/` and `server/`, not `caz/`.
