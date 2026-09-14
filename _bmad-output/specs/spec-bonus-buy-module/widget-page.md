# Bonus Buy — widget page

Dedicated surface for the Bonus Buy module. Access from the **Open** button on the module card or direct URL — not from sidebar nav.

## Route

| Path | Component | Guards |
|------|-----------|--------|
| `/bonus-buy` | `BonusBuyPage` | `ProtectedRoute` → `AppShell` → `AccountActiveRoute` |

Register in `App.tsx` alongside `/modules` inside `AccountActiveRoute`. Owner and admin may access (same as modules page).

## Access

No enable/toggle gate. Any operator with an active account selected may open `/bonus-buy` directly or via the card **Open** button.

## Page content

```
PageHeader
  title: Bonus Buy
  description: Bonus buy widget for your stream
  icon: Gift
  iconVariant: warning
  action: none (create moved into history card header)

History Card (cardSx)
  section header: Gift icon tile + History / description + New button
  AppTable (account-scoped bonus_buy rows) — see bonus-buy-records.md

Create Dialog (title + start_balance) — see bonus-buy-records.md
```

No back button required — operator uses sidebar **Modules** or browser back.

## Session page link

History table **Open** action navigates to `/bonus-buy/:id` — full session workspace per `session-page.md`.

## Card → page link

On `/modules`, Bonus Buy card footer shows **Open** only — navigates to `/bonus-buy` via `react-router` `Link`.

## Nav shell

**No** new sidebar or mobile tab entry. `/bonus-buy` is reached from the module card or direct URL.

## Component reference

Align `BonusBuyPage` with `TeamPage.tsx`: `AppTable`, `PageHeader`, `StatusAlert`, `NotificationContext`, `cardSx`, `inputFieldSx`, `toneChipSx`, `mutedChipSx` from `@/theme/colors`.
