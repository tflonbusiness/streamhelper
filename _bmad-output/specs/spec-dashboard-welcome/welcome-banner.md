# Welcome banner — dashboard home

Load-bearing companion for CAP-1–CAP-4. Layout, copy, and data resolution for the personalized welcome on `/dashboard` home mode.

## Placement

| # | Section | Status |
|---|---------|--------|
| 1 | Page header — H1 «Главная», lead «Обзор команды и активности» | Existing |
| 2 | **Welcome banner** | **New (this spec)** |
| 3 | Тариф card | Existing |
| 4 | Статистика Kick | Existing |
| 5 | Other home sections | Unchanged |

Hidden when `user.accountId` is unset (picker mode or pre-account session).

## Component contract

Extract into `DashboardWelcomeBanner` (or equivalent) consumed by `DashboardHomePage.tsx`. Page owns section order; component owns copy, session read, and optional kick-channel fetch for slug.

### Visual

- shadcn `Card` with subtle border; no hero imagery.
- Top line: greeting as `CardTitle` (`text-xl` or `text-2xl`).
- Second line: stream context as `CardDescription`.
- Role: `Badge variant="secondary"` inline on the greeting line or immediately below — same styling as `SessionContext`.

### Copy (Russian)

| Element | Template | Source |
|---------|----------|--------|
| Greeting | `Привет, {name}!` | `user.name` from `/auth/me` |
| Stream | `Стрим: {label}` | See resolution below |
| Role badge | `Владелец` or `Админ` | `user.role` |

When `user.name` is empty (edge case), greeting: `Добро пожаловать!`

### Stream label resolution

Priority order:

1. **Kick slug** — from `GET /accounts/:accountId/kick/channel` when response is 200; display as `kick.com/{slug}` (link opens new tab).
2. **Account name** — `user.accountName` when kick channel 404 or not yet loaded.
3. **Missing** — `Стрим: —` with muted description «Канал Kick не подключён».

Do **not** show live title, viewer count, or «В эфире» in the welcome block — confirmed: live state stays only in `KickChannelStatsSection` below.

### Loading and error behavior

| State | Greeting + role | Stream line |
|-------|-----------------|-------------|
| Session ready | Immediate | Skeleton (`Skeleton` ~12rem) while kick fetch in flight |
| Kick 200 | Immediate | Linked `kick.com/{slug}` |
| Kick 404 | Immediate | `user.accountName` or «Канал Kick не подключён» |
| Kick 5xx / network | Immediate | `user.accountName` if present; else muted «Не удалось загрузить канал» |

Never block the whole dashboard on kick fetch failure.

### Relationship to shell `SessionContext`

- Shell keeps compact team name + role for navigation context.
- Welcome banner is the **home orientation** surface: friendly greeting + explicit stream entry point.
- Acceptable overlap of role badge on home only; shell unchanged.

## Role visibility

| Element | Owner | Admin |
|---------|-------|-------|
| Welcome banner | yes | yes |
| Role badge | Владелец | Админ |
