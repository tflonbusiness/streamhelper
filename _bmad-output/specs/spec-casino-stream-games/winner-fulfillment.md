# Winner Confirmation & Bonus Fulfillment

Applies to all games in `games-catalog.md`. Implements CAP-3 and CAP-4.

## Round end sequence

1. **Determine winner** — Apply game rule (deterministic or RNG with logged seed).
2. **Overlay** — Full-screen or prominent panel: winner username, game name, round timestamp, optional prize label.
3. **Bot chat** — Single message tagging winner: e.g. `@winner — you won [Game]! Bonus from streamer incoming. Proof: WIN-XXXX`.
4. **Proof token** — Unique ID (`WIN-` + short code) stored in round record; same token shown on overlay and dashboard.
5. **Optional DM** — If Kick API supports bot DM to user, send proof message; if not, steps 2–4 are sufficient for MVP.

## Streamer dashboard

| Field | Purpose |
|-------|---------|
| Winner username | Kick user id + display name |
| Game | Game ID from catalog |
| Round started / ended | Timestamps |
| Proof token | Winner can cite to streamer |
| Fulfillment status | `pending` → `fulfilled` (manual toggle) |
| Reminder | Highlight unfulfilled wins older than configurable threshold |

## Streamer responsibility (v1)

- Streamer manually sends casino promo code or bonus to winner (DM, chat, or external).
- Platform does not validate bonus delivery or integrate with casino operators.
- Marking `fulfilled` in dashboard is operational record only.

## Trust & audit

- Round log: participant pool (user ids), commands received, RNG seed or rule path, winner selection event.
- Overlay may show participant count; full participant list optional for transparency on random-draw games.
- Streamer reputation handles bonus delivery; proof token protects viewer if streamer forgets.

## Anti-abuse (platform defaults)

- One qualifying action per user per phase.
- Ignore commands from banned/timed-out users (via `moderation.banned` webhook if subscribed).
- Configurable global command cooldown (open question: per-game overrides).
