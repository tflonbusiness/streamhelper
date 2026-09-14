# Modules catalog — streamer product modules

Static catalog for `/modules`. IDs are stable for future backend mapping.

## Module rows

| ID | Name (RU) | Description (RU) | Catalog status | Default enabled |
|----|-----------|-------------------|----------------|-----------------|
| `casino-stream-games` | CasinoStream — игры | Библиотека интерактивных игр для чата Kick с overlay и одним победителем за раунд. | `available` | false |
| `obs-overlay` | OBS Overlay | Browser source для отображения состояния игр на стриме. | `coming_soon` | — |
| `round-history` | История раундов | Журнал раундов, победителей и статусов выплат. | `coming_soon` | — |
| `kick-integration` | Kick — интеграция | Подключение канала Kick и приём chat-команд. | `coming_soon` | — |

## UI status mapping

| Catalog status | Badge | Interaction |
|----------------|-------|-------------|
| `available` | «Доступен» or «Подключён» when toggled on | Toggle enabled |
| `coming_soon` | «Скоро» | No toggle; card muted |

## Card layout

Each module card (`Card`):

- **Header:** module name + status badge
- **Content:** description (2–3 lines max)
- **Footer:** toggle (available only) or static «Скоро» text

## Persistence (mock)

```ts
// localStorage key
`caz-modules-${accountId}`

// value: JSON string array of enabled module ids
// e.g. ["casino-stream-games"]
```

On toggle: read array, add/remove id, write back. On page load: merge catalog with stored ids to show «Подключён» state.

## Future backend (out of scope)

When Postgres module table exists, replace localStorage reads/writes with `GET/PATCH /accounts/:id/modules`. Keep the same module IDs.
