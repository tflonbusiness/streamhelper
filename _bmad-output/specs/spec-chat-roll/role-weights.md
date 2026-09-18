# Chat Roll — eligible role weights

Operator selects which viewer categories may join, sets a **weight** per enabled category, and chooses how weights combine when a viewer matches multiple enabled roles.

## Role catalog

| ID | UI label | Description (helper, muted) | Default enabled | Default weight |
|----|----------|----------------------------|-----------------|----------------|
| `moderator` | Moderator | Channel moderators | off | `1` |
| `vip` | VIP | VIP badge in chat | on | `2` |
| `og` | OG | OG badge in chat | off | `1.5` |
| `channel_follower` | Channel follower | Follows the channel | off | `1` |
| `paid_subscriber` | Paid subscriber | Active paid subscription | on | `2` |

## Weight combine (operator setting)

| Mode | UI label | Rule |
|------|----------|------|
| `highest` | Use highest coefficient | `max(matching role weights)` |
| `sum` | Sum coefficients | `sum(matching role weights)` |

Radio group in Settings, default `highest`. Persisted in localStorage.

**Example:** viewer has `og` (1.5) + `vip` (2), both enabled — **highest** → `2x`, **sum** → `3.5x`.

## Participant coefficient display

Each **Participants** row shows a chip with formatted coefficient (`2x`, `3.5x`, `0x`). Recomputed when:

- role toggles or weights change
- combine mode changes

`0x` when the participant has no roles matching currently enabled categories.

## Settings behavior

- Operator may enable any subset (zero to five).
- Disabled role: weight input hidden.
- Validation: `0.1` ≤ weight ≤ `100`.

## Kick mapping (deferred)

See prior table — integration slice maps sender flags to `roleIds`.
