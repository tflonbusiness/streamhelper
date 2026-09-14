# Mock stats — dashboard home preview

Static demo metrics on `/dashboard`. No API. All values hardcoded in the frontend.

## Stat cards

| Key | Label (RU) | Demo value | Subtext (RU) |
|-----|------------|------------|--------------|
| `streams` | Стримов за 30 дней | 12 | +3 к прошлому месяцу |
| `rounds` | Игровых раундов | 847 | за последние 7 дней |
| `participants` | Участников в чате | 4 210 | уникальных ников |
| `modules_active` | Активных модулей | derived | count of enabled modules from localStorage, min display 0 |

## Layout

- shadcn `Card` per stat
- Large number: `text-3xl font-semibold`
- Label: `text-sm text-muted-foreground`
- Subtext: `text-xs text-muted-foreground`
- Grid: `grid grid-cols-2 lg:grid-cols-4 gap-4`

## Section chrome

Above grid:

- **Heading:** Статистика (`h2`, `text-lg font-medium`)
- **Hint:** `p.text-xs.text-muted-foreground` — «Демо-данные для предпросмотра»

## `modules_active` derivation

At render, read `caz-modules-{accountId}` from localStorage; display array length. If parse fails, show `0`. Updates when user returns from `/modules` without full reload (optional: listen to `storage` event or lift state — not required for MVP).
