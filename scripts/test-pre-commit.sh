#!/usr/bin/env bash
# Runs before git commit (see scripts/git-hooks/pre-commit).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then
  # shellcheck source=/dev/null
  . "$NVM_DIR/nvm.sh"
  nvm use 26 >/dev/null
else
  echo "pre-commit: nvm not found (expected Node 26). Install nvm or run tests manually." >&2
  exit 1
fi

STAGED="$(git diff --cached --name-only --diff-filter=ACMR || true)"
if [[ -z "$STAGED" ]]; then
  exit 0
fi

if ! printf '%s\n' "$STAGED" | grep -qE '^(server|app|e2e)/'; then
  exit 0
fi

echo "pre-commit: running tests (Node $(node -v))..."

if printf '%s\n' "$STAGED" | grep -q '^server/'; then
  echo "→ server unit tests"
  (cd "$ROOT/server" && npm test)
fi

if printf '%s\n' "$STAGED" | grep -qE '^(server|app|e2e)/'; then
  echo "→ server Growing Jackpot API e2e"
  (cd "$ROOT/server" && npm run test:e2e -- growing-jackpot)
fi

if printf '%s\n' "$STAGED" | grep -qE '^(app|e2e)/'; then
  if [[ "${PRE_COMMIT_SKIP_UI_E2E:-}" == "1" ]]; then
    echo "→ skipping Playwright UI e2e (PRE_COMMIT_SKIP_UI_E2E=1)"
  else
    echo "→ Playwright UI e2e (Growing Jackpot)"
    if [[ ! -d "$ROOT/e2e/node_modules" ]]; then
      echo "pre-commit: run 'cd e2e && npm install' first." >&2
      exit 1
    fi
    if lsof -ti:3000 >/dev/null 2>&1 && ! lsof -ti:5173 >/dev/null 2>&1; then
      echo "pre-commit: port 3000 is in use but 5173 is not — start 'cd app && npm run dev' or set PRE_COMMIT_SKIP_UI_E2E=1" >&2
      exit 1
    fi
    echo "→ Playwright Chromium (skip if already installed)"
    (cd "$ROOT/e2e" && npm run install:browsers)
    (cd "$ROOT/e2e" && npm test)
  fi
fi

echo "pre-commit: tests passed."
