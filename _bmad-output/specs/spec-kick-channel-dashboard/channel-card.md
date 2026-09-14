# Channel card — «Канал Kick»

Load-bearing companion for CAP-1 and CAP-3. Russian copy, shadcn `Card`, renders only the eleven allowlisted DTO fields.

## Component

- **Name:** `KickChannelCard` (suggested)
- **Parent:** `DashboardHomePage` — placement per `dashboard-placement.md`
- **Props:** `accountId: number` from `useAuth().user.accountId`

## Card chrome

| Element | Text |
|---------|------|
| Title | Канал Kick |
| Description | Подключённый канал на Kick |

## Layout

```
┌─────────────────────────────────────────┐
│ [bannerPicture — h-24 object-cover]     │
├─────────────────────────────────────────┤
│ john-doe  [В эфире] [18+]               │
│ [streamThumbnail] My first stream       │
│ Old School Runescape · 67 зрителей      │
│ 150 подписчиков · 30 gifted             │
│ Channel description…                    │
│ kick.com/john-doe →                     │
└─────────────────────────────────────────┘
```

## Field rules

| DTO field | UI copy / behavior |
|-----------|-------------------|
| `slug` | Semibold; external link `https://kick.com/{slug}`, `target="_blank"`, trailing `→` |
| `isLive` | Badge: «В эфире» (live) or «Не в эфире» (offline) |
| `isMature` | Badge «18+» next to live badge; only when `isLive && isMature` |
| `streamTitle` | `font-medium`; fallback «Без названия» |
| `streamThumbnail` | Small image left of title; only when `isLive` |
| `categoryName` | Muted text; if live also show ` · {viewerCount} зрителей` on same line |
| `viewerCount` | «{n} зрителей» — only when `isLive` |
| `activeSubscribersCount` | «{n} подписчиков» on muted line |
| `activeGiftedSubscribersCount` | «{n} gifted» on same line, separated by ` · ` |
| `channelDescription` | `text-muted-foreground line-clamp-2`; omit if empty |
| `bannerPicture` | Full-width top strip inside card; omit block if null |

Subscriber line: render when at least one count is non-null. Example: `150 подписчиков · 30 gifted`.

## States

| State | UI |
|-------|-----|
| Loading | `Card` with skeleton rows or `CardDescription`: «Загрузка канала…» |
| Error (non-404) | `Alert variant="destructive"`: «Не удалось загрузить канал Kick» |
| No channel (404) | Muted text inside card: «Канал Kick не подключён» |
| Success | Full layout above |

## Data fetch

```ts
// app/src/api/kick-channel.ts (suggested)
GET /accounts/{accountId}/kick/channel  // session cookie
```

- Fetch in `useEffect` when `accountId` is set
- No polling; refetch on `accountId` change only

## Visibility

Shown on `/dashboard` for owner and admin when `user.accountId` is defined. No picker-mode conditions.
