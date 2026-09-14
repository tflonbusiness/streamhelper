---
id: SPEC-kick-channel-dashboard
companions:
  - kick-channel-api.md
  - channel-card.md
  - dashboard-placement.md
  - ../spec-caz-agent-ui-improvement/design-tokens.md
  - ../spec-caz-agent-ui-improvement/components.md
  - ../spec-streaming-oauth-auth/kick-oauth-setup.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate.

# Caz Agent — Kick channel on dashboard

## Why

**Pain:** `/dashboard` shows tariff and demo stats but no real Kick channel context — streamers cannot see live/offline status, current stream title, audience size, or subscriber metrics for their connected channel.

**Opportunity:** After Kick OAuth provisions `account_channels`, show live channel data from `GET https://api.kick.com/public/v1/channels` on the dashboard home. Server proxies Kick, returns only public safe fields; UI renders a single «Канал Kick» card.

**Who:** Owner and admin with an active session and `accountId` (Russian UI, dark shadcn). No team-picker flow — one account per owner per oauth spec.

## Field contract (11 allowlisted fields)

| DTO field | Kick source | UI (Russian) | When shown |
|-----------|-------------|--------------|------------|
| `slug` | `slug` | Ссылка `kick.com/{slug}` | Always |
| `streamTitle` | `stream_title` | Название стрима | Always |
| `channelDescription` | `channel_description` | Описание (2 строки) | If present |
| `bannerPicture` | `banner_picture` | Баннер сверху карточки | If present |
| `categoryName` | `category.name` | Категория / игра | If present |
| `isLive` | `stream.is_live` | «В эфире» / «Не в эфире» | Always |
| `isMature` | `stream.is_mature` | Badge «18+» | Only when live + mature |
| `viewerCount` | `stream.viewer_count` | «{n} зрителей» | Only when live |
| `streamThumbnail` | `stream.thumbnail` | Превью стрима | Only when live |
| `activeSubscribersCount` | `active_subscribers_count` | «{n} подписчиков» | If present |
| `activeGiftedSubscribersCount` | `active_gifted_subscribers_count` | «{n} gifted» | If present |

**Never exposed:** `stream.key`, `stream.url`, `broadcaster_user_id`, `category.id`, `canceled_subscribers_count`, `custom_tags`, `language`, `start_time`, upstream `message`.

Full mapping and denylist: `kick-channel-api.md`. Layout and copy: `channel-card.md`. Placement: `dashboard-placement.md`.

## Capabilities

- **CAP-1**
  - **intent:** An operator sees the team's Kick channel summary on `/dashboard` — identity, live state, stream info, audience when live, and subscriber metrics.
  - **success:** «Канал Kick» card renders between tariff and stats per `dashboard-placement.md`; all eleven allowlisted fields display per rules in `channel-card.md`; slug opens `https://kick.com/{slug}` in a new tab.

- **CAP-2**
  - **intent:** The server fetches channel data from Kick and returns a minimal safe DTO.
  - **success:** `GET /accounts/:accountId/kick/channel` reads primary `account_channels` row, calls `GET /public/v1/channels` with App Access Token, maps eleven fields, strips secrets; `channelDescription` truncated to 200 chars server-side; empty Kick `data` → `404`.

- **CAP-3**
  - **intent:** The card handles loading, error, and missing-channel states in Russian.
  - **success:** Loading: skeleton or «Загрузка канала…»; error: destructive Alert «Не удалось загрузить канал Kick»; 404: «Канал Kick не подключён»; no uncaught rejections.

- **CAP-4**
  - **intent:** Dev and e2e use stable mock data without calling Kick.
  - **success:** `KICK_OAUTH_MOCK=true` returns mock DTO from `kick-channel-api.md` with slug `kick_user_mock`; mock OAuth login still provisions matching `account_channels` row.

## Constraints

- Official Kick API only — `GET /public/v1/channels`.
- Server-side proxy — `KICK_CLIENT_SECRET` and App Access Token never reach `app/`.
- App Access Token via client-credentials (`KICK_CLIENT_ID` / `KICK_CLIENT_SECRET`); no persisted user refresh tokens.
- Membership guard on `accountId` — same pattern as `members-api.md`.
- Read-only — no channel/stream edits.
- One primary Kick channel per account (`is_primary=true`).
- Fetch once on page mount; no polling or WebSocket.
- UI: shadcn dark Russian per adopted `design-tokens.md` and `components.md`.
- Mock stats section below the card stays unchanged.

## Non-goals

- Persisting Kick user refresh tokens.
- Live auto-refresh of channel data.
- Replacing mock stat cards with real analytics.
- Connecting, switching, or editing Kick channels from UI.
- Team picker / multi-account switch (removed per oauth spec).
- Exposing `canceled_subscribers_count` or internal Kick IDs.

## Success signal

Owner logs in via mock Kick OAuth → `/dashboard` shows «Канал Kick» with slug `kick_user_mock`, «Не в эфире», stream title, subscriber line, link to kick.com → mock stats unchanged below → admin logs in via access link → sees same card for that account → with `KICK_OAUTH_MOCK=false`, card shows live Kick data for provisioned slug. `npm run build` in `app/` passes; server e2e covers `GET /accounts/:accountId/kick/channel`.

## Assumptions

- App Access Token can read channel by `slug` or `broadcaster_user_id` without user OAuth session.
- `activeSubscribersCount` and `activeGiftedSubscribersCount` are public engagement metrics appropriate for the home card.
- Gifted subs label stays «gifted» in Russian UI (Kick product term) unless copy is revised later.
