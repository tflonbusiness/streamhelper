---
id: SPEC-prize-spin-stream-widget
companions:
  - stream-widget-page.md
  - widget-design.md
  - prize-spin-widget.md
  - ../spec-prize-spin-session-page/SPEC.md
  - ../spec-app-english-only/SPEC.md
  - ../spec-caz-agent-ui-improvement/design-tokens.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Caz Agent — Prize Spin stream widget

## Why

**Pain:** Prize Spin session workspace (`spec-prize-spin-session-page`) lets operators configure sectors and run spins from the dashboard, but viewers on stream see nothing — there is no OBS overlay to display the wheel or reveal the winner. The module description promises a weighted prize wheel for stream engagement; without a public widget page the spin result stays invisible to the audience.

**Who:** Stream operator (configures size, opens overlay URL) and stream viewers (see wheel animation and winner on broadcast). English UI per adopted `spec-app-english-only`.

## Capabilities

- **CAP-1**
  - **intent:** A viewer or operator opens the public stream overlay at `/prize-spin/:id/widget` without signing in.
  - **success:** Route registered outside `ProtectedRoute` and `AppShell`; page fetches `GET /prize-spins/:id/widget` without auth; transparent viewport; OBS Browser Source works without dashboard session cookie; unknown `:id` shows **Session not found.** on the overlay canvas.

- **CAP-2**
  - **intent:** The overlay renders a prize wheel from the session's active sectors inside a dark glass card.
  - **success:** Donut wheel with one colored segment per non-archived sector; arc size proportional to `winPercent`; amber pointer at 12 o'clock; purple gradient hub; labels on segments ≥18° arc; fewer than two sectors shows dashed ring and **Add sectors in dashboard**; card, colors, and proportions per `widget-design.md`.

- **CAP-3**
  - **intent:** The overlay animates a wheel spin and lands on the winning sector when a new win appears.
  - **success:** Polling detects a new `latestWin.id`; **SPINNING** badge shows; wheel rotates 5 full turns over 3.8s with `cubic-bezier(0.12, 0.75, 0.1, 1)` and stops with winning `sectorId` under pointer; pointer bounce and hub glow on settle; same win id never re-animated; geometry from `prize-spin-wheel-geometry.ts`.

- **CAP-4**
  - **intent:** The overlay shows the latest winner's nick and prize after the spin completes.
  - **success:** Glass **Winner:** banner slides up with `participantNick` and `sectorLabel`; visible after animation ends or immediately on load when a prior win exists (static rest, no replay); hidden when `latestWin` is null; styling per `widget-design.md`.

- **CAP-5**
  - **intent:** An operator opens the stream overlay from the prize spin session workspace.
  - **success:** Session page header has **Overlay** button navigating to `/prize-spin/:id/widget`; **OBS link** shows **Coming soon** toast (Bonus Buy parity); no query params on overlay URL.

- **CAP-6**
  - **intent:** The system persists account-level widget dimensions shared by all prize spin sessions.
  - **success:** `prize_spin_widget` row per `account_id` with `width`/`height` per `prize-spin-widget.md`; bootstrap on account provision and first `POST .../prize-spins`; lazy insert on widget GET; authenticated `GET`/`PATCH /accounts/:accountId/prize-spin-widget`; public overlay resolves settings via session account.

- **CAP-7**
  - **intent:** An operator adjusts overlay width and height from the session workspace.
  - **success:** **Widget size** opens dialog with **Width** and **Height** fields (200–2400 px); loads account settings on open; valid **Save** PATCHes settings and shows success toast; invalid values show `StatusAlert` in dialog; changes apply to all sessions for the account.

## Constraints

- **English UI** on overlay labels, empty states, and session header actions per adopted `spec-app-english-only`.
- **Display-only overlay** — spins are initiated from the dashboard (`spec-prize-spin-session-page` CAP-4); viewers do not trigger spins from the widget.
- **Public overlay route** — `/prize-spin/:id/widget` outside auth shell; live data via public widget API only.
- **Poll interval** — 5000 ms refetch on overlay page (match Bonus Buy stream widget).
- **Widget dimensions** — width and height each 200–2400 px; defaults 500×500; overlay reads from DB only — no URL size query params.
- **Sector visuals** — wheel segment fill from `prize_spin_sector.color`; card chrome, pointer, hub, and typography from fixed tokens in `prize-spin-widget-theme.ts` per `widget-design.md`; no theme columns on `prize_spin_widget` in this slice.
- **Overlay card** — dark glass `#0A0A0CE6` with 20px radius and shadow; viewport outside card stays transparent for OBS chroma-key.
- **Brownfield schema** — use existing `prize_spin_widget` table; add `PrizeSpinController`, `DatabaseService` helpers, and client API per companions.
- **Latest win only** on overlay — no scrollable winner history; full history stays on session page.
- **Session page delta** — add **Overlay**, **Widget size**, and **OBS link** stub to `PrizeSpinSessionPage` header without changing existing sector/spin/history panels.

## Non-goals

- Full widget theme presets (background, accent palette, border radius) on `prize_spin_widget` — dimensions only in this slice.
- WebSocket, SSE, or signed OBS token for overlay updates.
- Kick chat integration or viewer-triggered participation on the overlay.
- Winner history list, drop statistics, or XLSX export on the overlay page.
- Replay spin animation on page load for an existing `latestWin` — static rest position + banner only.
- Sound effects, particle confetti, or 3D wheel perspective.
- iframe or in-dialog live preview of the overlay inside **Widget size** dialog.

## Success signal

An operator configures three wheel sectors on `/prize-spin/:id`, opens **Overlay** at `/prize-spin/:id/widget` in OBS (transparent 500×500 source), enters a viewer nick on the session page and clicks **Spin** — within one poll cycle the stream overlay animates the wheel, lands on the winning sector, and shows **Winner:** with the nick and prize label; operator opens **Widget size**, sets width to 600, saves, and the overlay resizes on next load without changing sector colors.

## Assumptions

- Wheel segment arc angles are proportional to `winPercent` values (not equal slices).
- Fixed overlay tokens in `prize-spin-widget-theme.ts` scale linearly from a 500×500 base via `scaleForSize`.
- On initial overlay load with an existing `latestWin`, wheel rests on that sector and banner shows without replay animation.
- `latestWin` in the public API is the newest non-archived win (`created_at DESC`).
