# Chat Roll — module catalog entry

Adds a third row to `/modules` per adopted `modules-catalog.md`. English copy.

## Catalog row

| Field | Value |
|-------|-------|
| ID | `chat-roll` |
| Name | Chat Roll |
| Description | Weighted chat giveaway — viewers join with a keyword; pick a random winner with VIP and subscriber boost. |
| Catalog status | `available` |
| Interaction | **Open** button → `/chat-roll`; no toggle |

## Card layout

Same structure as **Bonus Buy**:

- **Header:** **Chat Roll** + **Available** badge
- **Content:** description (2 lines max)
- **Footer:** primary **Open** button

## Grid order

1. Bonus Buy
2. Wheel of Fortune (`coming_soon`)
3. **Chat Roll** (`available`)

## Route

| Path | Shell | Auth |
|------|-------|------|
| `/chat-roll` | `AppShell` + sidebar | `ProtectedRoute` |

## Icon

`Dices` from `lucide-react` (or `Dice5` if unavailable) in `PageHeader` and module card `IconTile`.

## Nav

No dedicated sidebar item in this slice — reach via `/modules` only (Bonus Buy parity).

## Kick channel prerequisite

When account has no linked Kick channel, `/chat-roll` shows `StatusAlert` with link to dashboard channel setup — **Connect your Kick channel to run Chat Roll.** Start collection disabled.
