---
id: SPEC-subscription-entitlements
companions:
  - plan-entitlements.md
  - get-envelope-and-compliance.md
  - ../../planning-artifacts/architecture/architecture-subscription-entitlements-2026-10-01/ARCHITECTURE-SPINE.md
sources:
  - ../../brainstorming/brainstorm-subscription-tiers-trial-pro-max-2026-10-01/.memlog.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for audit only.

# Caz Agent — Subscription entitlements (trial / pro / max)

## Why

**Pain:** Accounts today have binary subscription access (trial time box, then modules off) but no enforced **tier quotas** (sessions, sectors, slots, moderators). Downgrades can leave data over limit with no guided cleanup; OBS may keep running while the app should block.

**Opportunity:** Introduce **`plan_tier`**-driven limits for **trial**, **pro**, and **max**, expose them on **module GET** responses, gate the app UI and public widgets, and align platform admin + marketing with **max** (replacing studio).

**Who:** Streamer **owners** and **admins** (Russian UI); platform admin via `/service/subscriptions`.

## Capabilities

- **CAP-1**
  - **intent:** Every new account starts an active **trial** with correct **`plan_tier`** and 3-day access window; platform admin can set **trial / pro / max** or revoke.
  - **success:** Account provision sets `plan_tier=trial` and `ends_at` from account creation + 3 days; admin update accepts **pro** and **max** (not studio); revoked accounts have `hasAccess=false`; migration path documented for `full`/`studio` rows.

- **CAP-2**
  - **intent:** Server computes limits, usage, and compliance from one shared implementation tied to **`plan_tier`**.
  - **success:** `PLAN_ENTITLEMENTS` matrix matches `plan-entitlements.md`; counting rules match AD-4; `compliance` is `ok` or `over_limit`; unit tests cover trial/pro/max and over-limit detection after downgrade.

- **CAP-3**
  - **intent:** Operators see entitlement state when loading module pages via existing GET APIs.
  - **success:** Bonus Buy, Prize Spin, and Chat Roll list/session GET responses include `entitlements`, `usage`, and `compliance` per `get-envelope-and-compliance.md`; Team/moderator limits included where team GET is used for invites.

- **CAP-4**
  - **intent:** The app prevents actions that would exceed limits or ignore over-limit lockout without server INSERT guards in phase 1.
  - **success:** Create/copy/add controls disabled at cap; over-limit shows warning and blocks non-removal actions; after delete/archive, **refetch session GET** restores interaction when `compliance === ok`; copy disabled when two non-archived sessions exist.

- **CAP-5**
  - **intent:** OBS browser-source widgets stop when subscription is inactive or account is over limit.
  - **success:** Public widget GET returns `subscription_expired` when `!hasAccess`; returns `entitlement_over_limit` when compliant access but `over_limit`; overlay copy distinct for each reason; e2e or integration test for expired path preserved and over-limit path added.

- **CAP-6**
  - **intent:** Team admins understand when the account subscription is inactive.
  - **success:** Admin on dashboard with `!hasAccess` sees banner «Подписка команды не активна — свяжитесь с владельцем аккаунта»; owner still reaches `/subscription`.

## Constraints

- **Canonical tier:** `account_subscriptions.plan_tier` — not `subscription_plan` for limits (`plan-entitlements.md`).
- **Phase 1 enforcement:** GET payloads + UI only — **no INSERT/assert guards** on create/copy/sector/slot/invite (phase 2).
- **Expired access:** Unchanged — modules/team behind `SubscriptionAccessRoute`; widgets use `subscription_expired`.
- **Over-limit:** Removal-only in UI until compliant; unlock via **refetch session GET**, not page reload, not delete response body fields.
- **Billing:** Manual platform admin only — no checkout (extends existing subscription tab constraints).
- **Architecture:** Implement per adopted spine AD-1–AD-10 phase-1 rules.

## Non-goals

- Phase 2 server **`ENTITLEMENT_LIMIT`** / **`ENTITLEMENT_OVER_LIMIT`** on POST mutations, go-live, spin, kick intake.
- Stripe or automated billing.
- Caching usage in Redis/materialized counters.
- 80% soft-warning banners.
- Changing owner-only `/subscription` routing from `spec-subscription-tab`.

## Success signal

New account receives trial **`plan_tier`** → module session GET shows limits 2/10/20/1 → UI disables 3rd session create → admin sets pro → limits update on next GET → downgrade to trial with excess sectors → session GET `over_limit`, widget GET `entitlement_over_limit` → user archives sectors → refetch session GET → `compliance ok` and widget poll shows active → expired trial → dashboard + subscription only, widget `subscription_expired`, admin banner visible.

## Assumptions

- Session **archived** status field names match each module’s existing schema.
- Module list GET endpoints are the ones already used by history pages (no new routes required beyond response shape).
