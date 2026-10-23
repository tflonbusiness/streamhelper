# Growing Jackpot — architecture spine

## Purpose

Timed chat pool: viewers join with a keyword; displayed prize grows per join; one weighted winner at timer end. Manual bonus fulfillment by streamer.

## Data

- `growing_jackpot` — session (`live` / `off_air` / `archived`), JSON settings.
- `growing_jackpot_round` — `accepting` → `drawing` → `closed`; snapshot `join_keyword` + settings; `rng_seed`, `proof_token`, fulfillment.
- `growing_jackpot_participant` — one row per user per round.
- `growing_jackpot_widget` — account-level OBS width/height.

## Kick intake

`KickCommandRouter` records one `kick_chat_event` per message, then fan-out: First Reaction, Chat Roll, Growing Jackpot (`GrowingJackpotIntakeHandler`). Same keyword can hit multiple modules in parallel.

## Round lifecycle

- Start: only if session `live`, no prior round in `accepting`/`drawing`.
- Join: snapshot keyword on round; idempotent participant insert.
- End: cron-like `closeAllDueRounds` (10s) + on-demand on public widget read; 0 participants → `no_participants`; else weighted draw + optional chat announce.
- New round only after previous `closed`.

## APIs

- Dashboard: `/accounts/:id/growing-jackpots/...`, `/accounts/:id/growing-jackpot-widget`.
- Public overlay: `GET /growing-jackpots/widget/:ucid` (poll ~400ms when active).

## Frontend

- Module routes under `/modules/growing-jackpot`; OBS page uses API dimensions + `winnerOverlaySeconds` auto-hide after `closedAt`.
