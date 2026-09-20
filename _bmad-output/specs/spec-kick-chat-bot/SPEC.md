---
id: SPEC-kick-chat-bot
companions:
  - ARCHITECTURE-SPINE.md
  - dev-cloudflare-tunnel.md
sources:
  - ../spec-chat-roll/SPEC.md
  - ../spec-casino-stream-games/architecture-flows.md
---

# Kick chat bot — command intake

## Why

**Opportunity:** Chat Roll sessions need live participant intake from Kick chat. Operators set a custom keyword per session (e.g. `!join`, `!roll`). The platform receives `chat.message.sent` webhooks on a single app endpoint, routes by `broadcaster_user_id`, and inserts participants into the live session.

## Capabilities

- **CAP-1**
  - **intent:** Kick delivers `chat.message.sent` events to one platform webhook URL; the server routes by broadcaster channel id.
  - **success:** `POST /webhooks/kick` verifies signature (or mock mode), deduplicates by `message_id`, and dispatches to command handlers.

- **CAP-2**
  - **intent:** A viewer typing the session keyword on a live Chat Roll session is added as a participant.
  - **success:** Exact keyword match (case-insensitive trim) on `status = 'live'` session inserts `chat_roll_participant` with `provider = 'kick'` and mapped `role_ids` from badges; dedup per `(chat_roll_id, provider, provider_user_id)`.

- **CAP-3**
  - **intent:** An operator toggles whether the bot replies in Kick chat when someone joins.
  - **success:** `chat_roll.reply_in_chat` persisted on session; when `true` and participant created, bot posts confirmation via `POST /public/v1/chat` (`type: bot`).

- **CAP-4**
  - **intent:** Local development works without a public URL.
  - **success:** `KICK_CHAT_MOCK=true` enables `POST /dev/kick/chat` injection and skips signature verification; Cloudflare Tunnel documented for real webhook testing.

## Constraints

- **Single webhook URL** — one `POST /webhooks/kick` for all accounts; route by `account_channels.channel_id`.
- **Custom keyword** — per-session `chat_roll.keyword` (1–32 chars); exact match only in MVP.
- **Live session only** — no intake when `status != 'live'`.
- **Entry gate** — respect `is_accepting_participants`; return without chat reply when paused.
- **Idempotency** — `kick_chat_events.message_id` PRIMARY KEY.
- **Event subscription** — on owner Kick OAuth provision, subscribe `chat.message.sent` v1 for `channel_id`.

## Non-goals

- Multiple keywords per session
- Command arguments (`!roll 5`)
- Twitch / YouTube intake (schema ready, handlers later)
- Winner announcement in chat
- WebSocket / Pusher transport

## Success signal

With `KICK_CHAT_MOCK=true`, operator sets live session keyword `!join` and `reply_in_chat = true`, injects mock chat via `POST /dev/kick/chat`, participant appears in DB, mock log shows bot reply. With Cloudflare Tunnel + real Kick app, typing `!join` in live Kick chat adds participant within one webhook delivery.
