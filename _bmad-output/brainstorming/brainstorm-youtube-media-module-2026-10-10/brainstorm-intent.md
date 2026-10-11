# Intent — YouTube media module

**Source:** brainstorming session `brainstorm-youtube-media-module-2026-10-10`  
**Downstream:** `_bmad-output/specs/spec-youtube-media-module/`

## Problem / opportunity

Streamers need a hands-off **YouTube jukebox** for the broadcast: viewers spend **channel points** to queue tracks via **YouTube links**; the operator controls playback, layout, and fallback music when nothing is ordered.

## Must ship

- **Order queue** with per-item **title**, **duration**, **requester nick**
- **Transport:** pause, skip, reorder; **volume**; **window size**; **video on/off**
- **Backup** playlist/track when queue is empty (streamer not distracted)
- **Owner/mod:** add **track or playlist** to **queue** or **backup**
- **Burned points** visibility for the operator

## Context from ideation (not all in MVP kernel)

- Price preview, hold/charge timing, refunds on reject, link validation, blacklist, anti-abuse — see spec `open_questions` and `points-economy.md`

## Product decisions (resolved)

1. **Backup cutover** — account setting `immediate` \| `finish_current_track`
2. **Burned points** — sum all viewer `points_charged` **regardless of queue status**
3. **Viewer limit** — max track **duration** (`max_viewer_track_duration_seconds`)
4. **Viewer orders** — **Kick redemption webhook** only (`channel.reward.redemption.updated`)
