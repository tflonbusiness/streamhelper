# Player, overlay, and module settings

Account-level settings for YouTube playback, queue policy, and OBS browser source. One settings row per `account_id` (pattern aligned with `bonus_buy_widget`).

## Playback & overlay fields

| Field | Purpose |
|-------|---------|
| `volume` | 0–100, applies to YouTube player output |
| `show_video` | Boolean; when false, audio-only (minimal or hidden video surface) |
| `overlay_width` | px, clamp 200–1920 |
| `overlay_height` | px, clamp 120–1080 |

## Module policy fields

| Field | Purpose |
|-------|---------|
| `backup_cutover` | `immediate` — stop backup the moment a queue item becomes now playing; `finish_current_track` — let the active backup track end, then start the queue item |
| `max_viewer_track_duration_seconds` | Reject viewer webhook orders when metadata duration exceeds this limit (staff enqueue exempt) |
| `kick_reward_ids` | JSON array of Kick reward IDs that trigger this module for the account |

## Operator UI

- Controls on the module workspace (`/modules/media-interactive`): volume slider, video toggle, width/height inputs or presets (e.g. Small / Medium / Large).
- Changes apply to **live overlay** within one refresh or WebSocket tick (same realtime channel as queue state).

## Public overlay route

- Unauthenticated route outside `AppShell`, e.g. `/modules/media-interactive/widget` or account-scoped token URL — match existing module overlay security pattern from Bonus Buy / Prize Spin.
- Renders YouTube embed (or iframe API) sized to `overlay_width` × `overlay_height`.
- Displays **now playing** strip: title, total duration, requester nick (see `playback-queue.md`).

## OBS

- **Copy OBS link** action copies overlay URL.
- **Open overlay** opens new tab for preview.
