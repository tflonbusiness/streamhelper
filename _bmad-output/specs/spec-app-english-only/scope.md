# Translation scope

Files and surfaces that must contain English-only user-facing copy after implementation.

## `app/index.html`

- `lang="ru"` → `lang="en"`

## `landing/index.html`

- `<title>`, meta description, og:title, og:description, hero paragraph, CTA link text — all English.

## `app/src` — pages

| File | Surfaces |
|------|----------|
| `LoginPage.tsx` | Brand description, invalid-link alert, session-expired and OAuth error messages |
| `DashboardHomePage.tsx` | Page title and description |
| `TeamPage.tsx` | Page header, members table (headers, badges, actions), dialogs, form labels, toast messages |
| `ModulesPage.tsx` | Page header, module status badges, switch aria-labels, games section, footer note |
| `SubscriptionPage.tsx` | Page title and description |

## `app/src` — components

| File | Surfaces |
|------|----------|
| `AppShell.tsx` | Nav labels (Home, Team, Modules, Subscription, Settings), Soon badge, Sign out |
| `KickLoginButton.tsx` | Sign in with Kick |
| `DashboardWelcomeBanner.tsx` | Role labels, card descriptions, channel error states |
| `KickChannelStatsSection.tsx` | Stream status, viewer/subscriber labels, error messages, section title |
| `SubscriptionPlanCard.tsx` | Plan card titles and descriptions |
| `DashboardTariffCard.tsx` | Manage subscription link |
| `TelegramActivationNotice.tsx` | Activation title, body, CTA |
| `LoadingScreen.tsx` | Loading text |
| `ui/dialog.tsx` | Close sr-only label |

## `app/src` — lib and API

| File | Surfaces |
|------|----------|
| `lib/subscription-plan.ts` | Plan name, blurbs, feature bullet lists |
| `lib/games-mock.ts` | Eight game display names (English library names) |
| `lib/modules.ts` | Module names and descriptions |
| `api/auth.ts` | Default error fallback messages |
| `api/kick-channel.ts` | Error class message and fetch fallback |

## `server/src`

| File | Surfaces |
|------|----------|
| `auth/kick-channel.service.ts` | Demo `streamTitle` and `channelDescription` |

## `server/test`

| File | Surfaces |
|------|----------|
| `accounts.e2e-spec.ts` | Assertions and request payloads using Cyrillic demo strings |

## Out of scope

- `_bmad-output/**` planning and spec artifacts — update companion Russian copy only when that feature is next touched
- `node_modules/**`
- Kick.com OAuth provider UI
- `app/dist/**` (rebuilt by `npm run build`)
