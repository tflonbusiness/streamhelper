# Kick channel API — server proxy

Load-bearing companion for CAP-2. Proxies `GET https://api.kick.com/public/v1/channels` and returns an **eleven-field allowlisted DTO** — public, useful, and safe only.

## Caz endpoint

| Method | Path | Auth |
|--------|------|------|
| GET | `/accounts/:accountId/kick/channel` | Session cookie; active member of `accountId` |

### Response `200`

```json
{
  "slug": "john-doe",
  "streamTitle": "My first stream",
  "channelDescription": "Channel description",
  "bannerPicture": "https://kick.com/img/default-banner-pictures/default2.jpeg",
  "categoryName": "Old School Runescape",
  "isLive": true,
  "isMature": true,
  "viewerCount": 67,
  "streamThumbnail": "https://kick.com/img/default-thumbnail-pictures/default2.jpeg",
  "activeSubscribersCount": 150,
  "activeGiftedSubscribersCount": 30
}
```

### Response rules

- `viewerCount`, `streamThumbnail` — set only when `isLive=true`; otherwise `null` or omit.
- `channelDescription` — truncate to 200 characters server-side.
- Fields not in the allowlist are **never** forwarded to `app/`.

### Errors

| Status | When |
|--------|------|
| 401 | No session |
| 403 | Not a member of `accountId` |
| 404 | No primary `account_channels` row (`provider='kick'`) or empty Kick `data[]` |
| 502 | Kick API error |
| 503 | App Access Token unavailable in real mode |

## Kick upstream

**Envelope:**

```json
{
  "data": [{ /* channel object */ }],
  "message": "text"
}
```

Use `data[0]`. Example upstream channel object (fields we care about):

```json
{
  "slug": "john-doe",
  "stream_title": "My first stream",
  "channel_description": "Channel description",
  "banner_picture": "https://…",
  "active_subscribers_count": 150,
  "active_gifted_subscribers_count": 30,
  "category": { "id": 101, "name": "Old School Runescape", "thumbnail": "https://…" },
  "stream": {
    "is_live": true,
    "is_mature": true,
    "viewer_count": 67,
    "thumbnail": "https://…",
    "key": "REDACTED",
    "url": "REDACTED"
  }
}
```

**Request:**

```
GET https://api.kick.com/public/v1/channels?slug={channel_slug}
Authorization: Bearer {app_access_token}
```

Fallback: `?broadcaster_user_id={channel_id}` from `account_channels`.

Lookup: `account_id = :accountId`, `provider = 'kick'`, `is_primary = true`.

## Allowlist (11 fields)

| DTO | Kick `data[0]` |
|-----|----------------|
| `slug` | `slug` |
| `streamTitle` | `stream_title` |
| `channelDescription` | `channel_description` |
| `bannerPicture` | `banner_picture` |
| `categoryName` | `category.name` |
| `isLive` | `stream.is_live` |
| `isMature` | `stream.is_mature` |
| `viewerCount` | `stream.viewer_count` |
| `streamThumbnail` | `stream.thumbnail` |
| `activeSubscribersCount` | `active_subscribers_count` |
| `activeGiftedSubscribersCount` | `active_gifted_subscribers_count` |

## Denylist — never map

| Field | Reason |
|-------|--------|
| `stream.key` | Stream secret |
| `stream.url` | RTMPS ingest URL |
| `stream.custom_tags` | Not needed on dashboard |
| `stream.start_time` | Not needed on dashboard |
| `stream.language` | Not needed on dashboard |
| `broadcaster_user_id` | Internal ID |
| `category.id` | Internal ID |
| `category.thumbnail` | Redundant |
| `canceled_subscribers_count` | Excluded by product decision |
| `message` | Upstream envelope noise |

## App Access Token

```
POST https://id.kick.com/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id={KICK_CLIENT_ID}
&client_secret={KICK_CLIENT_SECRET}
```

Cache in memory until expiry. Skip when `KICK_OAUTH_MOCK=true`.

## Mock payload (`KICK_OAUTH_MOCK=true`)

```json
{
  "slug": "kick_user_mock",
  "streamTitle": "Демо-стрим CasinoStream",
  "channelDescription": "Тестовый канал для разработки",
  "bannerPicture": null,
  "categoryName": "Slots & Casino",
  "isLive": false,
  "isMature": false,
  "viewerCount": null,
  "streamThumbnail": null,
  "activeSubscribersCount": 0,
  "activeGiftedSubscribersCount": 0
}
```

## Server implementation

- Service: `KickChannelService` (new) or shared helper on `KickOAuthService`.
- Controller: accounts module, membership guard like members API.
- Types: `KickChannelDto` in server; mirror in `app/src/api/kick-channel.ts`.
- E2e: cover 200 mock, 401, 403, 404.

## Client type (suggested)

```ts
export type KickChannelDto = {
  slug: string
  streamTitle: string | null
  channelDescription: string | null
  bannerPicture: string | null
  categoryName: string | null
  isLive: boolean
  isMature: boolean
  viewerCount: number | null
  streamThumbnail: string | null
  activeSubscribersCount: number | null
  activeGiftedSubscribersCount: number | null
}
```
