#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
chmod +x scripts/test-pre-commit.sh scripts/git-hooks/pre-commit
git config core.hooksPath scripts/git-hooks
echo "Git hooks path set to scripts/git-hooks (pre-commit → scripts/test-pre-commit.sh)"
