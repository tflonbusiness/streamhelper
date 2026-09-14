# Surfaces — `/subscription`

Russian copy, shadcn components, hierarchy per adopted UI spec.

## `/subscription` — SubscriptionPage

**Access:** owner only. Admin users: nav item hidden; direct URL → redirect `/dashboard`.

- **Shell:** `nav-shell.md` + `nav-delta.md` with «Подписка» active (owners only)
- **H1:** Подписка
- **Lead:** Тариф и возможности вашей команды

### Content (top to bottom)

1. **Current plan card** (`Card`)
   - Title: Текущий тариф
   - Description: План подписки команды
   - Badge: plan label from `subscriptionPlan` — `free` → «Бесплатный»; other values shown as-is until a plan catalog exists
   - Team name and role **not** repeated — shown in shell `SessionContext`

2. **Activation contact** (`Alert` or `Card`)
   - Body (exact lead copy): «Для активации подписки свяжитесь с нами в Telegram»
   - Telegram account: **`parsyuk`** — display as clickable `@parsyuk` linking to `https://t.me/parsyuk` (`target="_blank"`, `rel="noopener noreferrer"`)
   - Optional override via `VITE_TELEGRAM_SUPPORT_USERNAME`; when unset, default to `parsyuk`
   - No payment checkout, no «скоро» badge on this block

### States

- No `accountId` (picker mode): route unreachable — nav item disabled per `nav-delta.md`
- `role === 'admin'`: nav hidden; route guard redirects to `/dashboard`
- Loading session: skeleton or spinner on plan badge area only if session is still resolving

## `/dashboard` — tariff card (home mode)

Improved summary per `dashboard-tariff-card.md`. Stays on the main page alongside channel stats — **not** removed when `/subscription` ships.

- Quick glance: plan badge + one-line blurb for all roles
- Owner CTA: «Управление подпиской →» links to `/subscription`
- Admin: read-only card, no subscription link
