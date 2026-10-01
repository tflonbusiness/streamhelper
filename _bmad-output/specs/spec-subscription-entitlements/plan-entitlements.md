# Plan tiers and entitlement matrix

Canonical tier id: **`account_subscriptions.plan_tier`** — `trial` | `pro` | `max`.

## Matrix (phase 1)

| plan_tier | Non-archived sessions per module | Prize Spin sectors per session | Bonus Buy slots per session | Admin members (role `admin`, owner excluded) |
| --- | --- | --- | --- | --- |
| trial | 2 | 10 | 20 | 1 |
| pro | 5 | 20 | 40 | 2 |
| max | unlimited (`null`) | unlimited | unlimited | unlimited |

## Trial provisioning

- New account: insert `account_subscriptions` with `kind=trial`, `status=active`, **`plan_tier=trial`**, `ends_at = account.created_at + 3 days` (existing `TRIAL_DURATION_DAYS`).
- Migrate legacy `plan_tier=full` → `trial` or `max` per admin policy; **`studio` → `max`** everywhere (admin API, app catalog, landing copy).

## Counting (shared server helper)

| Dimension | Rule |
| --- | --- |
| Sessions | Per module (`bonus_buy`, `prize_spin`, `chat_roll`); count session rows where status **≠ archived**; archived unlimited |
| Copy session | New non-archived session counts toward cap (UI disables at cap in phase 1) |
| Sectors | Per `prize_spin_id` |
| Bonus slots | Non-archived slots per `bonus_buy_id`; archive frees quota |
| Admins | Active memberships with `role === 'admin'` |

## Access vs entitlements

- **`hasAccess === false`**: no module routes (existing); public widgets `subscription_expired`; no entitlement payload required.
- **`hasAccess === true`**: evaluate matrix from `plan_tier`; compute **`compliance`**: `ok` if no dimension exceeds limit; `over_limit` otherwise.

## Display mirror

`accounts.subscription_plan` stays for admin/UI labels; **limits must not be derived from it** — only from `plan_tier`.
