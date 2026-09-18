# Chat Roll — page layout (`/chat-roll`)

Single-page workspace. Four zones top to bottom: **PageHeader**, **Settings**, **Action bar**, **Participants | Winners**.

## Page header

| Element | Value |
|---------|-------|
| Title | Chat Roll |
| Icon | `Casino` |
| Description | Weighted chat giveaway for your stream |

## Settings card

`Card` titled **Settings**, full width above the two columns.

### Keyword row

| Field | Control | Default | Validation |
|-------|---------|---------|------------|
| Keyword | `TextField` | `!roll` | Required, trimmed, 1–32 chars |

Helper text: **Viewers must send this exact message to join.**

### Role weights block

Titled **Eligible roles**. Five rows per `role-weights.md`.

Each row:

| Element | Control |
|---------|---------|
| Role label | English name + short description (muted) |
| Enabled | `Switch` |
| Weight | `TextField` type number — visible only when enabled |

### Weight combine row

`RadioGroup` (row layout):

| Value | Label |
|-------|-------|
| `highest` | Use highest coefficient |
| `sum` | Sum coefficients |

Helper: **When a viewer matches multiple enabled roles, choose how weights combine for the win chance.**

Footer hint: **Only viewers matching an enabled role can join. Weight affects pick probability when rolling.**

Changes persist per session immediately — no **Save** button.

## Action bar

Row between Settings and the two-column lists (`RollActionBar` pattern).

| Control | Label | Behavior |
|---------|-------|----------|
| Roll | **Roll** | Weighted random pick from active participants (unchanged when entries paused) |
| Pause / Resume | **Pause entries** when accepting; **Resume entries** when paused | Toggles `is_accepting_participants` on the session |
| Status chip | **Accepting entries** (success tone) or **Entries paused** (warning tone) | Reflects current gate state |

When **Entries paused**: keyword messages from chat are ignored; manual participant add from UI is blocked with inline message **Entries are paused. Resume to add participants.**

## Two-column lists

`Grid` `spacing={2}` with `size={{ xs: 12, md: 6 }}` per column.

### Participants column

`Card` with header row:

| Left | Right |
|------|-------|
| **Participants** (`Typography` subtitle1) | **Clear all** (`Button` size small, text or outlined) |

Body: vertical list of rows. Each row:

| Content | Actions |
|---------|---------|
| Display name (monospace) + role `Chip`s + coefficient `Chip` (e.g. `2x`, tone info) | `IconButton` delete (`aria-label` **Remove participant**) |

Coefficient recomputes from enabled role weights and combine mode. `0x` when no matching enabled roles.

Empty state: **No participants yet.**

### Winners column

Same structure as Participants:

| Header | **Winners** + **Clear all** |
| Row | Display name + delete `IconButton` (`aria-label` **Remove winner**) |
| Empty | **No winners yet.** |

## Responsive

- `md` and up: two columns side by side
- `xs`–`sm`: Participants stacks above Winners

## Out of scope (this slice)

- Collection timer (auto-pause)
- Kick channel status alert
- History table below lists
