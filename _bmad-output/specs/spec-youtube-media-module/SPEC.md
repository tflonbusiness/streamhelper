---
id: SPEC-media-interactive-module
companions:
  - media-interactive-module.md
  - playback-queue.md
  - points-economy.md
  - player-overlay-settings.md
  - kick-redemption-webhook.md
  - ../spec-caz-team-dashboard/modules-catalog.md
  - ../spec-caz-team-dashboard/nav-shell.md
  - ../spec-app-english-only/SPEC.md
sources:
  - ../../brainstorming/brainstorm-youtube-media-module-2026-10-10/brainstorm-intent.md
  - ../../brainstorming/brainstorm-youtube-media-module-2026-10-10/.memlog.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate.

# Caz Agent — Media Interactive module

## Why

**Opportunity:** Viewers spend **Kick channel points** to queue **YouTube** tracks by link; the stream needs a reliable **order queue**, **operator transport controls**, **backup** audio when idle, and an **OBS overlay** — without the streamer babysitting playback.

**Who:** Account owner and moderators (English UI); viewers interact via points + link; audience sees the public overlay.

## Capabilities

- **CAP-1**
  - **intent:** An operator discovers and opens the YouTube Media module from the modules catalog.
  - **success:** Catalog row per `media-interactive-module.md` appears on `/modules` with **Open** navigating to `/modules/media-interactive`; card matches sibling layout and English copy (name **Media Interactive**).

- **CAP-2**
  - **intent:** An operator manages the live order queue on a dedicated workspace page.
  - **success:** `/modules/media-interactive` shows ordered list with title, duration, requester nick, and status; supports remove and reorder; reflects server state after refresh or realtime update; empty queue shows clear empty state.

- **CAP-3**
  - **intent:** An operator controls playback of the current item.
  - **success:** **Pause**, **Resume**, and **Skip** actions affect the active player and advance queue per `playback-queue.md`; skip updates item status and promotes next row; controls disabled when nothing is playable.

- **CAP-4**
  - **intent:** An operator adjusts playback, overlay layout, backup handoff, and viewer track length limits.
  - **success:** Volume 0–100, **show video** toggle, overlay width/height, **`backup_cutover`** (`immediate` \| `finish_current_track`), and **`max_viewer_track_duration_seconds`** persist per account per `player-overlay-settings.md`; overlay and backup behavior respect saved values.

- **CAP-5**
  - **intent:** The system plays backup content when no viewer queue item is active.
  - **success:** Separate backup list per `playback-queue.md`; when queue is empty, backup plays in order and loops; when a queue item becomes now playing, backup stops per `backup_cutover`; operator can edit backup list (add/remove/reorder).

- **CAP-6**
  - **intent:** An owner or moderator enqueues YouTube tracks or playlists without charging points.
  - **success:** Staff can add single URL or playlist to **queue** or **backup**; playlist expands to one row per video; items show `source = staff` and `points_charged = 0`; staff items are not subject to `max_viewer_track_duration_seconds`; unauthorized roles cannot call staff enqueue APIs.

- **CAP-7**
  - **intent:** An operator sees how many channel points were burned for song orders.
  - **success:** Workspace shows **today burned (UTC)** total equal to the sum of `points_charged` for **all** viewer orders in scope **regardless of status**, plus ledger rows (nick, title, points, status) per `points-economy.md`.

- **CAP-8**
  - **intent:** A viewer queues a YouTube track by redeeming a Kick channel reward that includes a link.
  - **success:** Signed **`channel.reward.redemption.updated`** webhook per `kick-redemption-webhook.md` creates at most one queue row per redemption; valid URL and duration ≤ `max_viewer_track_duration_seconds` enqueue with metadata and requester nick; invalid URL or over-length duration yields `rejected` with reason and no duplicate charge rows; production has no non-webhook viewer entry path.

- **CAP-9**
  - **intent:** A stream overlay shows what is playing for the audience without dashboard login.
  - **success:** Public overlay route renders player at configured size; **now playing** shows title, duration, and requester nick; state matches operator queue within realtime SLA used by sibling modules; OBS browser source works without session cookie.

- **CAP-10**
  - **intent:** An operator maps Kick channel rewards to this module.
  - **success:** Settings UI saves `kick_reward_ids` per account; only redemptions for configured IDs enqueue tracks; webhook handler ignores unmapped rewards.

## Constraints

- **English UI** for operator surfaces per adopted `spec-app-english-only`.
- **YouTube only** for media URLs in MVP (no SoundCloud, local files, or uploads).
- Viewer submissions are **single-video URLs** via **Kick webhook only**; playlist URLs are staff-only.
- Viewer orders must respect **`max_viewer_track_duration_seconds`** after metadata fetch.
- At most **one** `playing` queue item per account (no module sessions).
- Staff actions require **owner or moderator** membership on the account.
- Each viewer order stores `points_charged`, `kick_redemption_id`, and status for audit and burned totals.

## Non-goals

- Twitch/YouTube **OAuth** or multi-platform chat intake (Kick-first; extensibility only).
- **Skip voting**, chat command parsers, or viewer order forms outside Kick redemption.
- **Duration-based dynamic pricing** (cost is whatever the Kick reward costs) and VIP priority queues.
- **Auto scene switching** in OBS.
- **Automatic Kick refunds** when a mod rejects or skips a track.

## Success signal

On a live test stream, a viewer redeems a mapped Kick reward with a YouTube link, the webhook enqueues the track with correct metadata, it plays on the overlay, backup respects the configured **backup_cutover**, and **burned points (today, UTC)** on the dashboard equal the sum of all viewer redemption costs including rejected rows — without editing OBS between songs.

## Assumptions

- Kick debits points at redemption time; burned metrics mirror Kick spend, not playback outcome.
- Realtime transport matches an existing module pattern (WebSocket or polling) already used for stream widgets.
