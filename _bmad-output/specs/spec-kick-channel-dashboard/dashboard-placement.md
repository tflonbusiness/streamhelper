# Dashboard placement — Kick channel card

Load-bearing companion for CAP-1. Defines where the Kick channel block sits on `/dashboard` (owner and admin after login).

## Page context

- **Route:** `/dashboard` only — no team picker, no `/picker` route (per oauth spec).
- **Session:** `user.accountId` set after Kick OAuth or admin access-link login.
- **Audience:** Owner and admin; Russian UI; dark shadcn.

## Section order (top to bottom)

| # | Section | Status |
|---|---------|--------|
| 1 | Page header — «Главная» / «Обзор команды и активности» | Existing |
| 2 | **Тариф** card | Existing |
| 3 | **Канал Kick** card | **New (this spec)** |
| 4 | **Статистика** mock grid | Existing — unchanged |
| 5 | «Управление модулями →» link | Existing |

## Implementation note

Extract Kick channel UI into a dedicated component (e.g. `KickChannelCard`) consumed by `DashboardHomePage.tsx`. Page owns layout order; component owns fetch + states per `channel-card.md`.
