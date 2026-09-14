---
id: SPEC-telegram-bot-setup
companions: []
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Telegram bot app — initial setup

## Why

**Vision to realize:** stand up a React app that can later serve a Telegram bot, without building the bot yet. The immediate need is a runnable project whose first screen is only a greeting, so later work has a repo instead of starting from zero.

## Capabilities

- **CAP-1**
  - **intent:** An operator can scaffold a React app that starts locally so later Telegram-bot UI has a repo to grow from.
  - **success:** One documented local start command brings up the app; no extra undocumented setup steps are required.

- **CAP-2**
  - **intent:** A visitor opening the app sees only a greeting on the first screen.
  - **success:** The first view shows greeting copy and no other product screens, forms, or navigation.

## Constraints

- Implementation is React; a non-React first stack is out.
- This spec is initial setup plus the greeting screen only; bot logic, extra screens, and production deploy are out.
- The first screen is greeting-only: no forms, menus, or feature chrome on that view.

## Non-goals

- Telegram bot commands, webhooks, or bot-process code
- Auth, payments, or a backend
- Telegram Mini App / WebApp SDK wiring (unless a later spec adds it)
- Additional routes or screens beyond the greeting
- Production hosting

## Success signal

From a clean checkout, the documented start command runs and the first screen shows only a greeting. That demonstration closes this spec.

## Assumptions

- This is a React web app that will later attach to a Telegram bot (Mini App or similar), not the bot process itself.
- English greeting copy is acceptable until copy is specified.

## Open Questions

- Is this a Telegram Mini App (WebApp) or a separate admin/companion UI for the bot?
- Must the first run include Telegram WebApp init, or is a plain React greeting enough for setup?
- Preferred scaffold (Vite+React, Next, CRA) and package manager?
- Exact greeting text and language (RU/EN)?
