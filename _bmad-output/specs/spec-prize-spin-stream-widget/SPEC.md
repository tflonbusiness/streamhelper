---
id: SPEC-prize-spin-stream-widget
companions:
  - stream-widget-page.md
  - widget-design.md
  - stream-helper-wheel-reference.md
  - prize-spin-widget.md
  - ../spec-prize-spin-history-archive/session-status.md
  - ../spec-prize-spin-session-page/SPEC.md
  - ../spec-app-english-only/SPEC.md
  - ../spec-caz-agent-ui-improvement/design-tokens.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Stream Widgets — Prize Spin stream widget

## Why

**Pain:** Prize Spin session workspace (`spec-prize-spin-session-page`) lets operators configure sectors and run spins from the dashboard, but viewers on stream see nothing without an OBS overlay. The wheel must read clearly on broadcast and match the proven look from [stream-helper `/wheel/overlay`](https://github.com/novapointstrix/stream-helper) while fitting Caz Agent card chrome, configurable sector geometry (weighted or equal slices), and session-scoped URLs (`/modules/prize-spin/:id/widget`).

**Who:** Stream operator (configures widget, copies OBS URL for a session) and stream viewers (see wheel animation and winner). English UI per adopted `spec-app-english-only`.

## Capabilities

- **CAP-1**
  - **intent:** A viewer or operator opens the public stream overlay at `/modules/prize-spin/:prizeSpinId/widget` without signing in and sees that prize spin session when it is not archived.
  - **success:** Route registered outside `ProtectedRoute` and `AppShell`; page fetches `GET /prize-spins/:prizeSpinId/widget` without auth; transparent viewport outside the card; OBS Browser Source works without dashboard session cookie; unknown id → **Session not found.**; known id with `status = 'archived'` → **Session not found.** (or equivalent 404).

- **CAP-2**
  - **intent:** The overlay renders a prize wheel from the session's active sectors inside a dark glass card, with wheel visuals matching stream-helper's OBS pie wheel; arc **display** follows account widget settings without changing how wins are chosen.
  - **success:** Full **pie** wheel (not donut); when `settings.equalSectorSlices` is false, drawn arc size proportional to `winPercent`; when true, each active sector drawn with equal `360° / n` arc (stream-helper-style); white top pointer; sector gloss and white dividers; dark hub with module icon; outer rim strokes and soft halo per `widget-design.md` and `stream-helper-wheel-reference.md`; idle layout and spin **animation** use the same display geometry as drawing; fewer than two sectors shows empty state; card chrome (header, dimensions) unchanged; sector `winPercent` values in API unchanged regardless of toggle.

- **CAP-3**
  - **intent:** The overlay animates a wheel spin and lands on the winning sector when a new win appears.
  - **success:** Polling detects a new `latestWin.id` (winner already determined server-side by `win_percent` weights); **SPINNING** badge shows; wheel rotates 5 full turns over 3.8s with `cubic-bezier(0.12, 0.75, 0.1, 1)` and stops with winning `sectorId` under pointer using **display** geometry only; pointer bounce on settle; same win id never re-animated; geometry from `prize-spin-wheel-geometry.ts` respecting `equalSectorSlices`; when `record.id` changes (navigation to another session URL), reset animation state.

- **CAP-4**
  - **intent:** The overlay shows the latest winner's nick and prize after the spin completes.
  - **success:** Glass **Winner:** banner slides up with `participantNick` and `sectorLabel`; visible after animation ends or immediately on load when a prior win exists (static rest, no replay); hidden when `latestWin` is null; styling per `widget-design.md`.

- **CAP-5**
  - **intent:** An operator opens the stream overlay for the current session from the session workspace using a URL that includes that session's id.
  - **success:** **Stream Widget** card on `/modules/prize-spin/:id` exposes **Open overlay** → `/modules/prize-spin/{id}/widget` in a new tab; **OBS link** copies the full origin + same path; archived session → overlay shows **Session not found.** after load or poll.

- **CAP-6**
  - **intent:** The system persists account-level widget dimensions and equal-slice display mode shared by all prize spin sessions.
  - **success:** `prize_spin_widget` row per `account_id` with `width`, `height`, and `equal_sector_slices` per `prize-spin-widget.md`; **standard default 800×800 px** and `equal_sector_slices = true` on insert/bootstrap; authenticated `GET`/`PATCH /accounts/:accountId/prize-spin-widget`; public overlay `settings` includes `width`, `height`, and `equalSectorSlices`; client and server constants in `prize-spin-widget-defaults.ts` match DB defaults.

- **CAP-7**
  - **intent:** An operator adjusts overlay width, height, equal-sector display, and accesses overlay links from the session workspace, not the history page.
  - **success:** `/modules/prize-spin/:id` renders a **Stream Widget** card (Monitor icon, description, **Widget settings** button, **Open overlay**, **OBS link** copy) per `prize-spin-widget.md`; **Widget settings** dialog loads account settings on open with **Width**, **Height**, and **Equal sector slices** checkbox; valid **Save** PATCHes settings and shows success toast; `/modules/prize-spin` history page has no Stream Widget section.

- **CAP-9**
  - **intent:** The public overlay API resolves a single prize spin session by id without channel slug or ucid in the URL.
  - **success:** `GET /prize-spins/:prizeSpinId/widget` returns `PrizeSpinWidgetView` when the row exists and `status = 'active'`; `404` when id unknown or archived; removes legacy `GET /prize-spins/widget/:ucid` and app route `/modules/prize-spin/widget/:ucid`.

## Constraints

- **English UI** on overlay labels, empty states, warnings, and session workspace copy per adopted `spec-app-english-only`.
- **Display-only overlay** — spins are initiated from the dashboard (`spec-prize-spin-session-page` CAP-4); viewers do not trigger spins from the widget.
- **Public overlay route** — `/modules/prize-spin/:prizeSpinId/widget` outside auth shell; session id in path; no `accountId`, `channelSlug`, or `ucid` in the URL.
- **Module routes** — history `/modules/prize-spin`, session `/modules/prize-spin/:id`, overlay `/modules/prize-spin/:id/widget`; use `app/src/lib/routes.ts` helpers (`prizeSpinSessionRoute`, `prizeSpinWidgetRoute`).
- **Session status** — public widget serves `prize_spin.status = 'active'` only per adopted `session-status.md`; no go-live/deactivate or `is_active` singleton.
- **Poll interval** — 5000 ms refetch on overlay page (match Bonus Buy stream widget).
- **Widget dimensions** — width and height each 200–2400 px; **standard size 800×800 px** (account default on bootstrap and Widget settings form fallback) per `prize-spin-widget.md`; overlay reads from DB only — no URL size query params.
- **Display-only equal slices** — `equal_sector_slices` changes overlay drawing and spin animation geometry only (client); no API, DB sector weights, `POST .../spin`, or `pickWeightedSectorId` changes; session **Wheel sectors** panel and 100% rules unchanged (`spec-prize-spin-session-page`).
- **Sector visuals** — wheel segment fill from `prize_spin_sector.color`; wheel pointer, rim, hub, and gloss per `stream-helper-wheel-reference.md`; card chrome from `prize-spin-widget-theme.ts`; no theme color columns on `prize_spin_widget` in this slice.
- **Overlay card** — dark glass `#0A0A0CE6` with 20px radius and shadow; viewport outside card stays transparent for OBS chroma-key.
- **Wheel implementation** — SVG in `PrizeSpinWheel.tsx` / `prize-spin-wheel-visual.ts`; reproduce stream-helper canvas look without switching to HTML canvas.
- **Latest win only** on overlay — no scrollable winner history; full history stays on session page.
- **Session page delta** — **Stream Widget** card below header (not on history page); remove header-only **Widget size** duplicate if subsumed by **Widget settings** dialog.

## Non-goals

- Full widget theme presets (background, accent palette, border radius) on `prize_spin_widget` — dimensions and equal-slice toggle only in this slice.
- Auto-adjusting sector `win_percent` when equal slices is enabled — weights stay operator-controlled on the session page.
- WebSocket, SSE, or signed OBS token for overlay updates.
- Kick chat integration or viewer-triggered participation on the overlay.
- Winner history list, drop statistics, or XLSX export on the overlay page.
- Replay spin animation on page load for an existing `latestWin` — static rest position + banner only.
- Sound effects, particle confetti, or 3D wheel perspective.
- iframe or in-dialog live preview of the overlay inside **Widget settings** dialog.
- Channel-slug or ucid-based public overlay URL (`/modules/prize-spin/widget/:ucid`, `GET /prize-spins/widget/:ucid`).
- **Stream Widget** card on `/modules/prize-spin` history page.
- Go-live / deactivate toggles, **Live** chip, or account-wide “single live session” (`live-session-control.md` superseded).
- stream-helper burger / `stream_icon` center assets or “Крутит • name” player pill above the wheel.
- Premium gold `WheelCanvas` preset from stream-helper admin UI (different from OBS canvas wheel).

## Success signal

An operator opens `/modules/prize-spin/12`, opens **Widget settings**, enables **Equal sector slices**, sets 600×600, saves, and copies **OBS link** for `/modules/prize-spin/12/widget`. With uneven sector weights on the session, the overlay still shows equal pie slices. They enter a viewer nick and **Spin** — within one poll cycle the wheel animates and lands on the correct winning sector; disabling the checkbox restores arcs proportional to **win %**.

## Assumptions

- Default `equal_sector_slices` is **true** (equal overlay slices out of the box); operators disable the checkbox for weighted arc display.
- `buildWheelSectors` (or equivalent) takes `equalSectorSlices` from public overlay settings; `rotationTickIndex` uses the same arc layout as drawing.
- Fixed overlay tokens in `prize-spin-widget-theme.ts` scale linearly from the 800×800 standard canvas via `scaleForSize` (`baseSize: 800`).
- On initial overlay load with an existing `latestWin`, wheel rests on that sector and banner shows without replay animation.
- `latestWin` in the public API is the newest non-archived win (`created_at DESC`).
- Hub center uses module `RotateCw` icon until a future slice adds configurable center assets.
