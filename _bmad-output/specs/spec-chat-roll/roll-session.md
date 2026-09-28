# Chat Roll — session page layout (`/modules/chat-roll/:id`)

Operator workspace for one chat roll session. Route: `ChatRollSessionPage` inside `AppShell`.

Zones top to bottom: **PageHeader**, **session header card**, then **two-column main workspace** (settings left, lists right).

## Page header

| Element | Value |
|---------|-------|
| Title | Chat Roll |
| Icon | `Casino` |
| Description | Weighted chat giveaway for your stream |

## Session header

Compact session card (`ChatRollSessionHeaderSection`): title `#id`, **Live** / **Archived** chips, **Go live** / **Off Air**, **Archive** — per existing session header spec.

## Main workspace (desktop `lg+`)

`Grid container` `spacing={3}`, `alignItems="stretch"`.

```
┌────────────────────────┬──────────────────────────────────────┐
│  LEFT (lg: 5)          │  RIGHT (lg: 7)                       │
│  Settings card         │  Participants | Winners (md: 6 each)  │
│  Roll action bar       │  (side-by-side within right column)    │
└────────────────────────┴──────────────────────────────────────┘
```

### Left column — settings and actions

Stack `spacing={3}`:

1. **Settings** card (full width of column) — keyword, weight combine, exclusion toggles, **Eligible roles** per `role-weights.md`. Edits stay local until **Save**; unsaved indicator and leave confirmation per `../spec-chat-roll-session-settings-save/SPEC.md`.
2. **Roll action bar** — **Roll**, **Pause entries** / **Resume entries** directly under settings (not between settings and lists globally).

### Right column — participants and winners

Nested `Grid container` `spacing={2}`:

| Column | Content |
|--------|---------|
| `size={{ xs: 12, md: 6 }}` | **Participants** list card |
| `size={{ xs: 12, md: 6 }}` | **Winners** list card |

Within the right column, `md+` keeps participants and winners side by side; on narrow right (`xs` only inside right stack) lists stack participants above winners.

## Settings card (left column)

### Keyword row

| Field | Control | Default | Validation |
|-------|---------|---------|------------|
| Keyword | `TextField` | `!roll` | Required, trimmed, 1–32 chars |

Helper text: **Viewers must send this exact message to join.**

### Weight combine row

`RadioGroup` (row layout):

| Value | Label |
|-------|-------|
| `highest` | Use highest coefficient |
| `sum` | Sum coefficients |

**Exclude winner from pool after roll**, **Reply in Kick chat when someone joins**, **Require winner chat response** (enables claim window), and **Response time (seconds)** (shown when enabled) toggles/fields in the same block.

### Role weights block

Titled **Eligible roles**. Five rows per `role-weights.md` (enable switch + weight field).

Footer hint: **Only viewers matching an enabled role can join. Weight affects pick probability when rolling.**

## Action bar (left column, below settings)

| Control | Label | Behavior |
|---------|-------|----------|
| Roll | **Roll** | Weighted random pick from eligible participants; not blocked by wins awaiting chat response |
| Pause / Resume | **Pause entries** / **Resume entries** | Toggles `is_accepting_participants` |

When **Entries paused**: chat keyword intake blocked per CAP-12; winner claim handling still runs.

## List cards (right column)

### Participants

| Left | Right |
|------|-------|
| **Participants** | **Clear all** |

Row: display name + role chips + coefficient chip; delete `IconButton`. Empty: **No participants yet.**

### Winners

| Left | Right |
|------|-------|
| **Winners** | **Clear all** |

Row: display name + response status chip (`Awaiting response` with countdown, `Confirmed`, `No response`, or none when feature off) + delete. Empty: **No winners yet.**

While session is **live**, participant and winner lists auto-refresh on a ~5s poll (CAP-14).

## Responsive

| Breakpoint | Layout |
|------------|--------|
| `lg+` | Settings + roll bar **left**; participants and winners **right** (pair side by side) |
| `xs`–`md` | Single column: header → settings → roll bar → participants → winners |

## Out of scope (this companion)

- Collection timer (auto-pause)
- Kick channel status alert
- History table below lists
- Stream widget card (follow-on slice)
