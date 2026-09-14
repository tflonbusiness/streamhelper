---
id: SPEC-casino-stream-games
companions:
  - games-catalog.md
  - winner-fulfillment.md
  - architecture-flows.md
  - ../spec-caz-agent-ui-improvement/components.md
sources:
  - ../../brainstorming/brainstorm-casino-stream-chat-games-2026-09-09/brainstorm-intent.md
  - ../../brainstorming/brainstorm-casino-stream-chat-games-2026-09-09/.memlog.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# CasinoStream — Interactive Chat Games Library

## Why

Casino streamers on Kick need sustained chat engagement to grow and retain audiences; CasinoStream sells a B2B subscription tool (~$50/mo) and must deliver a **library of overlay games** that turn passive viewers into active participants. The opportunity is a differentiated engagement layer—chat commands, on-stream visuals, single-winner rounds with streamer-distributed casino bonuses—that existing chat bots and manual giveaways do not provide as a cohesive product.

## Capabilities

- **CAP-1**
  - **intent:** A subscribed streamer can launch, run, and end any MVP library game during a live Kick stream with real-time overlay feedback visible to the audience.
  - **success:** In a test stream, the streamer starts each of the eight MVP games, overlay updates within one second of game state changes, and the round completes without manual chat moderation.

- **CAP-2**
  - **intent:** Viewers can join an active game round by sending configured chat commands; the system accepts at most one qualifying command per viewer per game phase.
  - **success:** Duplicate commands from the same viewer in the same phase are ignored; valid commands are recorded with username and server timestamp; chat command volume does not trigger per-user bot replies during play.

- **CAP-3**
  - **intent:** The system determines exactly one winner per game round using transparent, seed-logged random selection (or deterministic rules where the game defines a single winner, e.g. first correct response).
  - **success:** Every completed round has exactly one `winner_user_id`; round audit log includes RNG seed or deterministic rule applied, participant pool snapshot, and selection timestamp.

- **CAP-4**
  - **intent:** A confirmed winner is announced publicly via overlay, a single bot chat mention, and a unique proof identifier the winner can reference if the streamer delays bonus delivery.
  - **success:** Within five seconds of round end, overlay shows winner nick + game + timestamp; bot sends exactly one winner tag message; proof token is stored and visible in streamer dashboard.

- **CAP-5**
  - **intent:** A streamer can configure per-game parameters (timers, difficulty, caps, modes) from the dashboard before launching a round.
  - **success:** Each game's settings documented in `games-catalog.md` are exposed in dashboard, persisted per streamer, and applied to the next launched round without code changes.

- **CAP-6**
  - **intent:** A streamer can view round history, participant counts, winner records, and pending bonus fulfillment status.
  - **success:** Dashboard lists last N rounds with game type, winner, proof token, and fulfillment status (`pending` / `fulfilled`); streamer can mark a payout fulfilled manually.

- **CAP-7**
  - **intent:** The platform integrates with Kick exclusively through official APIs and documented webhooks (primarily `chat.message.sent` for command intake and chat post for winner announcement).
  - **success:** No dependency on unofficial Kick endpoints; integration test passes using documented Kick dev API flows only.

- **CAP-8**
  - **intent:** The MVP ships eight distinct game modes covering speed, mass pool, team psychology, elimination, code guess, FOMO cap, and streak retention use cases (catalog in `games-catalog.md`).
  - **success:** Each of the eight games is playable end-to-end on Kick with commands, overlay, single winner, and streamer settings as specified in the catalog.

## Constraints

- Exactly **one winner and one streamer bonus** per round; no multi-payout rounds in MVP.
- **Kick only** — no Twitch, YouTube, or other platform adapters in MVP.
- **Official Kick API only** — no `active-chatters`, watchtime proxies, or other unofficial endpoints.
- **Bot silent during play** — no per-participant chat replies; overlay carries live state; bot speaks once at winner announcement (plus optional single proof/DM if API supports it).
- **Commands only** for participation counting where applicable — arbitrary chat messages do not count toward game state (e.g. Growing Jackpot uses `!join`, not all messages).
- **No card-based games** in the library.
- **No hybrid/combo games** in MVP (e.g. Snap-Jackpot blends deferred).
- **Streamer manually distributes** promo codes/bonuses in v1; platform does not integrate with casino affiliate APIs for fulfillment.
- **Transparent RNG** — public or streamer-visible seed and participant log for random-winner games.
- Overlay is **OBS browser source** (or equivalent) driven by platform WebSocket/API; games must remain visually readable at casino-stream production sizes.
- **Project-wide UI stack:** streamer dashboard and any React UI in `app/` for this module use shadcn/ui on `@radix-ui/*` per adopted `components.md` — interactive controls via Radix-backed shadcn components, not bespoke widgets.

## Non-goals

- Automatic bonus or promo-code delivery to winners (v1).
- Channel Points redemption as game entry.
- Webhook-triggered games (KICK gifts, gifted subs, follower events) — rejected in brainstorming.
- Viewer watchtime or lurker tracking without chat commands.
- Games requiring many winners per round (Crash, Heist-style large qualifier pools).
- Trivia, bingo, hot-cold guessing, or card mechanics.
- Spin Prediction game — **out of MVP** until streamer workflow is validated (see `open_questions`).
- Subscription billing, streamer onboarding, or login UI (separate specs).

## Success signal

A paying casino streamer runs a 30-minute Kick stream using at least three different library games; chat command rate measurably exceeds their pre-CasinoStream baseline; each round produces exactly one auditable winner with overlay confirmation; the streamer marks bonuses fulfilled in dashboard without support tickets about "who won."

## Assumptions

- Streamers already use or will connect Kick OAuth with `events:subscribe` and `chat:write` scopes.
- Proof via Kick DM is optional enhancement — overlay + chat tag + dashboard token are sufficient for MVP if DM is unavailable.
- Streamer dashboard and overlay UI may use Russian copy consistent with existing CasinoStream login page.
- Anti-bot measures (minimum account age, rate limits) are platform-level defaults configurable per streamer but not game-specific unless noted.

## Open Questions

- Is **Spin Prediction** (`!bonus` / `!dead` before slot spin, streamer confirms outcome in dashboard) in MVP v1 or deferred until post-launch streamer feedback?
- Does Kick official API support **bot-initiated DMs** to winners for proof delivery, or is dashboard token + public overlay sufficient for launch?
- What **default anti-spam thresholds** (cooldowns, duplicate command window) apply globally vs per game?
