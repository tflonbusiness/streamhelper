# Nav shell — dashboard app chrome

Persistent layout for authenticated team surfaces. Replaces centered `PageShell` card pattern on `/dashboard`, `/team`, and `/modules`.

## Structure

```
┌─────────────────────────────────────────────────────────┐
│ [logo sm] Caz Agent          email · team · role  [↪]   │  ← top bar
├──────────┬──────────────────────────────────────────────┤
│ Главная  │  {page content}                              │
│ Команда  │                                              │
│ Модули   │                                              │
│ ──────── │                                              │
│ История  │  (disabled, «скоро»)                       │
│ Настройки│  (disabled, «скоро»)                       │
│          │                                              │
│ [Выйти]  │                                              │
└──────────┴──────────────────────────────────────────────┘
```

Mobile (<768px): sidebar collapses to hamburger sheet or bottom tab bar with «Главная», «Команда», and «Модули»; disabled items hidden on mobile.

## Top bar

| Element | Source | Notes |
|---------|--------|-------|
| Logo | `app/public/logo.svg` | `h-8`, alt «Caz Agent» |
| Product name | static | «Caz Agent» |
| User meta | session | `SessionContext` in sidebar (desktop) and mobile header — team name + role badge; user name only if different from team name |
| Switch team | button | Shown when `memberships.length > 1` and account selected; clears account context and returns `/dashboard` to picker mode |

Desktop main area has **no** duplicate user meta bar — session context lives only in the shell.

## Sidebar nav

| Route | Label | Active when | Picker mode |
|-------|-------|-------------|-------------|
| `/dashboard` | Главная | pathname starts with `/dashboard` | enabled |
| `/team` | Команда | pathname starts with `/team` | **disabled** until account selected |
| `/modules` | Модули | pathname starts with `/modules` | **disabled** until account selected |
| — | История | disabled, `aria-disabled`, badge «скоро» | hidden on mobile |
| — | Настройки | disabled, badge «скоро» | hidden on mobile |

Use shadcn `Button` `variant="ghost"` for nav items; active item gets `bg-accent` or `text-primary`.

## Logout

Footer of sidebar: `Button variant="ghost"` «Выйти» — calls existing logout API and redirects to `/`.

## Layout tokens

| Region | Tailwind |
|--------|----------|
| Shell | `min-h-svh flex flex-col md:flex-row` |
| Sidebar | `w-full md:w-56 border-r bg-card p-4 flex flex-col gap-1` |
| Main | `flex-1 p-6 overflow-auto` |
| Content max width | `max-w-5xl mx-auto w-full` |

## Component

Implement as `DashboardShell` (or `AppShell`) wrapping `<Outlet />` from react-router. Register in `App.tsx`:

```
/dashboard  → DashboardHomePage (shell child) — home or picker mode; accessible without accountId when 2+ memberships
/team       → TeamPage (shell child) — under AccountActiveRoute only
/modules    → ModulesPage (shell child) — under AccountActiveRoute only
```

`/dashboard` shell parent allows picker mode without selected account. `/team` and `/modules` require active account context.

All three shell routes share one `AppShell` parent where applicable.
