# Chat Roll — mock data and persistence

Client seed in `app/src/lib/chat-roll.ts`. Persisted per account in localStorage.

## Storage key

`caz-chat-roll-{accountId}`

## Persisted shape

```ts
type ChatRollPageState = {
  keyword: string
  combineMode: 'highest' | 'sum'
  roles: Record<RoleId, { enabled: boolean; weight: number }>
  participants: ChatRollParticipant[]
  winners: ChatRollWinner[]
}
```

Save on every state change. Load on mount; fall back to seed if missing or invalid.

## Participants seed

| `id` | `displayName` | `roleIds` | Coefficient (highest, defaults) |
|------|---------------|-----------|--------------------------------|
| `p1` | `nightowl_42` | `vip` | `2x` |
| `p2` | `slotking` | `paid_subscriber` | `2x` |
| `p3` | `mod_alex` | `moderator` | `0x` (mod disabled) |
| `p4` | `luckyviewer` | — | `0x` |
| `p5` | `og_wolf` | `og`, `vip` | `2x` (highest) / `3.5x` (sum if og enabled) |
| `p6` | `newfan99` | `channel_follower` | `0x` (follower disabled) |

## Winners seed

| `id` | `displayName` |
|------|---------------|
| `w1` | `past_winner_one` |
| `w2` | `past_winner_two` |
| `w3` | `past_winner_three` |

## Default settings seed

```ts
keyword: '!roll'
combineMode: 'highest'
roles: per role-weights.md defaults
```

## List actions

| Action | Behavior |
|--------|----------|
| Clear all participants | `participants = []` + save |
| Remove participant | filter by `id` + save |
| Clear all winners | `winners = []` + save |
| Remove winner | filter by `id` + save |
