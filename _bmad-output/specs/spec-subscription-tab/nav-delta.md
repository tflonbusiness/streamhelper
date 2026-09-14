# Nav shell delta — Подписка tab

Extends adopted `../spec-caz-team-dashboard/nav-shell.md`. Where this file conflicts, this delta wins for subscription work.

## Sidebar nav (updated)

| Route | Label | Active when | Picker mode |
|-------|-------|-------------|-------------|
| `/dashboard` | Главная | pathname starts with `/dashboard` | enabled |
| `/team` | Команда | pathname starts with `/team` | **disabled** until account selected |
| `/modules` | Модули | pathname starts with `/modules` | **disabled** until account selected |
| `/subscription` | Подписка | pathname starts with `/subscription` | **owner only**; **disabled** until account selected; **hidden** for admin |
| — | История | disabled, badge «скоро» | hidden on mobile |
| — | Настройки | disabled, badge «скоро» | hidden on mobile |

**Order:** «Подписка» sits after «Модули», before the `Separator` and disabled future items.

## Mobile nav

Include «Подписка» in the horizontal tab bar for **owners only**, alongside «Главная», «Команда», and «Модули». Same `requiresAccount` disable rules as team and modules. **Do not render** for `role === 'admin'`.

## App.tsx routing

```
/subscription → SubscriptionPage (shell child) — under AccountActiveRoute + OwnerRoute
```

Register route next to `/team` and `/modules` inside the `AccountActiveRoute` wrapper, wrapped by an owner guard that redirects non-owners to `/dashboard`.

## AppShell navItems

Add entry (render only when `user.role === 'owner'`):

```ts
{ to: '/subscription', label: 'Подписка', end: true, requiresAccount: true, requiresOwner: true }
```

Place after the modules entry. Filter out items where `requiresOwner` is true and `user.role !== 'owner'`.
