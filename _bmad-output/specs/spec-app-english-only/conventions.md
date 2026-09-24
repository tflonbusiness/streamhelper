# English-only UI conventions

Rules for Stream Widgets after the English migration. Apply to all new UI work.

## Language

- **User-facing copy is English only.** Labels, headings, descriptions, buttons, badges, toasts, alerts, empty states, aria-labels, and default API error messages shown to operators.
- **No Cyrillic** in `app/src`, `landing/`, or server responses/errors intended for the dashboard.
- **No i18n layer** until explicitly specced — strings live inline next to components or in small `lib/*` helpers (e.g. `subscription-plan.ts`).

## Naming reference

| Concept | English |
|---------|---------|
| Nav: dashboard | Home |
| Nav: team | Team |
| Nav: modules | Modules |
| Nav: subscription | Subscription |
| Nav: settings (future) | Settings |
| Coming soon | Soon |
| Sign out | Sign out |
| Sign in | Sign in with Kick |
| Owner role | Owner |
| Moderator role | Moderator |
| Free plan | Free |
| Live stream | Live |
| Offline stream | Offline |

## Game library (display names)

Wheel of Fortune, First Reaction, Growing Jackpot, Red vs Black, Tower, Safe Crack, Limit 50, Marathon.

## HTML

- `lang="en"` on `app/index.html` and `landing/index.html`.

## Tests

- Assertions and fixture strings match production English copy.
- After changing UI text, update corresponding tests in the same PR.

## Review checklist

Before merge: run `rg '[а-яА-ЯёЁ]' app/src landing server/src server/test` and resolve any user-facing hits.
