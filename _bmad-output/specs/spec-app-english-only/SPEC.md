---
id: SPEC-app-english-only
companions:
  - scope.md
  - conventions.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for audit only.

# Caz Agent — English-only application UI

## Why

**Mandate:** The product UI is currently Russian across the React app, landing page, and server-facing error/demo strings. The operator wants a single English interface and an English-only policy for all future work — no bilingual maintenance, no locale switching.

**Who:** Kick casino streamer operators using Caz Agent (dashboard, team, modules, subscription). English aligns the product with the CasinoStream game library naming (already English in brainstorm) and removes mixed-language drift between code, specs, and UI.

## Capabilities

- **CAP-1**
  - **intent:** An operator sees every user-visible string in the application in English.
  - **success:** A repo scan of `app/src`, `landing/`, and `server/src` finds zero Cyrillic characters in user-facing copy; login, nav, dashboard, team, modules, subscription, errors, badges, and mock game/module names render in English.

- **CAP-2**
  - **intent:** Browser documents declare English as the page language.
  - **success:** `app/index.html` and `landing/index.html` use `lang="en"`; `<title>` and meta description/og tags on the landing page are English.

- **CAP-3**
  - **intent:** Future features ship with English copy by default.
  - **success:** `conventions.md` is adopted as the project rule; any new UI string added after this change is English; no new Russian literals are introduced in scoped paths.

- **CAP-4**
  - **intent:** Tests and demo data stay consistent with the English UI.
  - **success:** `server/test` assertions and `kick-channel.service.ts` mock values use English strings; `npm run build` in `app/` passes; server e2e tests pass.

## Constraints

- **No i18n framework** in this slice — replace inline Russian strings with inline English; no locale files, no language switcher.
- **Scope** per `scope.md`: `app/src`, `app/index.html`, `landing/index.html`, server user-facing strings and tests; exclude `node_modules`, `_bmad-output`, and third-party OAuth screens.
- **Brand:** product name stays **Caz Agent**; game names use the English library names (Wheel of Fortune, First Reaction, Growing Jackpot, Red vs Black, Tower, Safe Crack, Limit 50, Marathon).
- **Prior BMad companions** with Russian UI copy (e.g. `spec-caz-team-dashboard/surfaces.md`, `spec-subscription-tab/surfaces.md`) are **not** batch-updated in this pass — refresh them only when that feature is next touched; until then, English from this spec wins in code.
- **Role labels:** Owner / Moderator (not Владелец / Админ; not Admin).

## Non-goals

- Multi-language i18n, locale detection, or per-user language preference.
- Translating BMad planning artifacts, brainstorming notes, or agent skill docs.
- Translating Kick.com or other third-party surfaces outside our codebase.
- Light mode or branding changes beyond language.

## Success signal

A fresh clone: operator opens landing → English hero and CTA → logs in via Kick → sidebar shows Home, Team, Modules, Subscription → all pages, toasts, errors, and stats labels are English → role badge shows **Moderator** not Admin → `rg '[а-яА-ЯёЁ]' app/src landing server/src server/test` returns no matches in user-facing strings → `npm run build` in `app/` passes.

## Assumptions

- Kick OAuth button label may remain vendor-controlled; our wrapper says "Sign in with Kick".
- Nav mapping: Главная→Home, Команда→Team, Модули→Modules, Подписка→Subscription, Настройки→Settings, Скоро→Soon.
- Plan `free` displays as **Free**; paid plan strings display verbatim if not `free`.
