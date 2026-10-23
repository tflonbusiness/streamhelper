# UI E2E (Playwright)

Browser tests for the React app against a live API and Vite dev server.

## Prerequisites

- Node.js **26** (`nvm use 26`)
- PostgreSQL with `DATABASE_URL` in `server/.env` (see `server/.env.example`)
- `KICK_OAUTH_MOCK=true` is set automatically for the API process started by Playwright

## Install

```bash
cd e2e
nvm use 26
npm install
npm run install:browsers
```

## Run

```bash
cd e2e
nvm use 26
npm test
```

Playwright starts `server` (`npm run start:dev`) and `app` (`npm run dev`) with `KICK_OAUTH_MOCK=true`.

Locally, Playwright **reuses** `localhost:3000` and `localhost:5173` when they are already running (typical during dev and pre-commit). Force a fresh start with `PLAYWRIGHT_FORCE_SERVERS=1`. When reusing, the API should run with `KICK_OAUTH_MOCK=true`.

## Pre-commit

From the repo root (once per clone):

```bash
./scripts/install-git-hooks.sh
```

On commits that touch `server/`, `app/`, or `e2e/`, the hook runs unit/API/UI tests with **Node 26** (`nvm use 26`). Skip Playwright with `PRE_COMMIT_SKIP_UI_E2E=1 git commit`. Bypass all hooks with `git commit --no-verify`.

## Auth

`tests/auth.setup.ts` logs in via `/auth/oauth/kick/callback?code=mock-kick-code` and saves `e2e/.auth/owner.json` for other tests.
