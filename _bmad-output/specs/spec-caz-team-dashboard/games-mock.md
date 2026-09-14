# Mock games — name cards only

Shown on `/modules` when module `casino-stream-games` is **подключён**. Static list — no launch, settings, or API.

Names align with `spec-casino-stream-games/games-catalog.md` IDs for future wiring.

| ID | Name (RU) |
|----|-----------|
| `wheel` | Колесо фортуны |
| `first-reaction` | Первая реакция |
| `growing-jackpot` | Растущий джекпот |
| `red-vs-black` | Красное vs Чёрное |
| `tower` | Башня |
| `safe-crack` | Взлом сейфа |
| `limit-50` | Лимит 50 |
| `marathon` | Марафон |

## Layout

- Section heading: **Игры** (`h2`, below module catalog grid)
- Visible only when `casino-stream-games` is in enabled set from localStorage
- Grid: `grid grid-cols-2 md:grid-cols-4 gap-3`
- Each item: shadcn `Card` with game name centered; no click action, no toggle
- Muted hint under grid: «Запуск игр будет доступен позже»

## Hidden when module off

If user toggles module off, game cards section hides immediately (client state).
