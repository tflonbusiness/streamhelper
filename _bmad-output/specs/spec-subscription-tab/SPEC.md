---
id: SPEC-subscription-tab
companions:
  - nav-delta.md
  - surfaces.md
  - dashboard-tariff-card.md
  - ../spec-caz-team-dashboard/nav-shell.md
  - ../spec-caz-agent-ui-improvement/design-tokens.md
  - ../spec-caz-agent-ui-improvement/components.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for audit only.

# Caz Agent — Subscription sidebar tab

## Why

**Pain:** Team subscription info (current plan) sits as a small card on the dashboard home, buried among stats and channel widgets. Operators have no dedicated place to review plan status or future upgrade options.

**Opportunity:** Add a **Подписка** entry in the persistent left nav — same chrome as Команда and Модули — with a focused `/subscription` page, while **improving** the dashboard tariff card so owners get a quick plan summary and a path to full subscription details.

**Who:** Account **owner** only (Russian UI, dark shadcn). Admins do not see or reach subscription UI.

## Capabilities

- **CAP-1**
  - **intent:** An owner navigates to a dedicated subscription page from the left sidebar (and mobile nav).
  - **success:** «Подписка» appears after «Модули» in `AppShell` **only when `role === 'owner'`**; click routes to `/subscription`; nav item shows active state (`bg-accent`); item is disabled in picker mode until account is selected; mobile tab bar includes the link for owners with identical gating; **admin users never see the nav item**.

- **CAP-2**
  - **intent:** An owner sees the active team's current subscription plan on the subscription page.
  - **success:** On `/subscription`, a plan card renders badge «Бесплатный» when `subscriptionPlan === 'free'`, otherwise the raw plan value; data comes from session/`/auth/me` without a new API.

- **CAP-3**
  - **intent:** The subscription page fits the existing app shell and routing model with owner-only access control.
  - **success:** `/subscription` is a child of `AppShell` under `AccountActiveRoute` plus an owner route guard; unauthenticated users cannot reach it; **admin hitting `/subscription` directly redirects to `/dashboard`**; inactive-account contact-to-pay routing unchanged; `npm run build` in `app/` passes.

- **CAP-4**
  - **intent:** An owner sees how to activate a paid subscription by contacting support on Telegram.
  - **success:** Below the plan card, copy «Для активации подписки свяжитесь с нами в Telegram» is visible; `@parsyuk` renders as an external link to `https://t.me/parsyuk`; env `VITE_TELEGRAM_SUPPORT_USERNAME` may override the default handle `parsyuk`.

- **CAP-5**
  - **intent:** An operator sees an improved tariff summary on the dashboard home without opening the subscription page.
  - **success:** On `/dashboard` home mode, tariff `Card` per `dashboard-tariff-card.md` shows plan badge, contextual one-line blurb, and header/description copy; owners additionally see «Управление подпиской →» linking to `/subscription`; admins see plan info only with no subscription link; card hidden in picker mode.

## Constraints

- **Nav delta:** fourth live shell route `/subscription`; layout contract in `nav-delta.md` extending adopted `nav-shell.md`.
- **Owner-only:** `role === 'owner'` required for nav visibility and route access; admins excluded entirely (hidden nav, redirect on direct URL).
- **Gating:** `requiresAccount: true` — disabled in picker mode until account is selected (owners only).
- **UI stack:** shadcn/ui on `@radix-ui/*`, dark-only, Russian copy — per adopted `design-tokens.md` and `components.md`.
- **Data source:** `subscriptionPlan` from existing session only; no new server endpoints or billing tables in this slice.
- **Dashboard tariff card:** keep and improve per `dashboard-tariff-card.md`; dashboard shows summary, `/subscription` shows full detail + Telegram activation.
- **Activation contact:** Telegram instructions per `surfaces.md`; default handle `parsyuk` (`@parsyuk` / `https://t.me/parsyuk`); overridable via `VITE_TELEGRAM_SUPPORT_USERNAME`; no payment provider, checkout, or invoice list.

## Non-goals

- Stripe, crypto, or any live payment flow.
- Server-side plan catalog, upgrade API, or subscription history.
- Admin access to subscription page or nav item.
- Changing `subscription_plan` values in the database from the UI.
- Light mode or new branding.

## Success signal

An owner with an active account logs in → `/dashboard` shows improved tariff card with «Бесплатный», blurb, and «Управление подпиской →» → sidebar «Подписка» → `/subscription` with Telegram `@parsyuk` link → picker mode disables «Подписка» until team selected. An admin → improved tariff card **without** subscription link → **no** «Подписка» in nav → `/subscription` redirects to `/dashboard` → `npm run build` in `app/` passes.

## Assumptions

- Plan label mapping: only `free` → «Бесплатный»; other plan strings display verbatim.
- Telegram is the sole activation channel in this slice (no in-app checkout).
- Support Telegram handle is `@parsyuk` unless overridden by env.
