# Modules catalog — streamer product modules

Static catalog for `/modules`. IDs are stable for future backend mapping. English copy per `spec-app-english-only`.

## Module rows

Exactly two cards render on `/modules` — no other catalog rows and no connected-modules summary banner above the grid.

| ID | Name | Description | Catalog status | Interaction |
|----|------|-------------|----------------|-------------|
| `bonus-buy` | Bonus Buy | Slot bonus-buy rounds for stream engagement — viewers trigger bonus features during live play. | `available` | **Open** button → `/bonus-buy`; no toggle |
| `wheel-of-fortune` | Wheel of Fortune | Spin-the-wheel chat game for Kick streams — prize segments and overlay coming later. | `coming_soon` | Non-interactive; **Soon** badge |

## UI status mapping

| Catalog status | Badge | Footer |
|----------------|-------|--------|
| `available` (Bonus Buy) | **Available** | Primary **Open** button to module route |
| `coming_soon` (Wheel of Fortune) | **Soon** | Static **Coming soon** chip; card slightly muted |

## Card layout

Each module card:

- **Header:** module name + status badge
- **Content:** description (2–3 lines max)
- **Footer:** **Open** (available, no toggle) or **Coming soon** chip (coming_soon)

## Removed rows (not on `/modules`)

These IDs are retired from the visible catalog in this slice — do not render cards for them:

- `casino-stream-games`
- `obs-overlay`
- `round-history`
- `kick-integration`

## Future backend (out of scope)

When a Postgres module table exists, replace any client-side module state with `GET/PATCH /accounts/:id/modules`. Keep the same module IDs.
