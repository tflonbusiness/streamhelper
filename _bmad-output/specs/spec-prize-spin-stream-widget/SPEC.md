---
id: SPEC-prize-spin-stream-widget
companions:
  - stream-widget-page.md
  - widget-design.md
  - prize-spin-widget.md
  - live-session-control.md
  - ../spec-prize-spin-session-page/SPEC.md
  - ../spec-app-english-only/SPEC.md
  - ../spec-caz-agent-ui-improvement/design-tokens.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Caz Agent — Prize Spin stream widget

## Why

**Pain:** Prize Spin session workspace (`spec-prize-spin-session-page`) lets operators configure sectors and run spins from the dashboard, but viewers on stream see nothing — there is no OBS overlay to display the wheel or reveal the winner. Operators need a fixed overlay URL keyed to their Kick channel that always reflects whichever session is live, without reconfiguring OBS when they switch sessions.

**Who:** Stream operator (goes live, opens overlay URL once in OBS) and stream viewers (see wheel animation and winner on broadcast). English UI per adopted `spec-app-english-only`.

## Capabilities

- **CAP-1**
  - **intent:** A viewer or operator opens the public stream overlay at `/prize-spin/widget/:channelSlug` without signing in and sees the account's currently live prize spin session.
  - **success:** Route registered outside `ProtectedRoute` and `AppShell`; page fetches `GET /prize-spin/widget/:channelSlug` without auth; transparent viewport; OBS Browser Source works without dashboard session cookie; unknown slug → **Session not found.**; known slug with no `is_active = true` session → **No live session.** warning on transparent canvas.

- **CAP-2**
  - **intent:** The overlay renders a prize wheel from the live session's active sectors inside a dark glass card.
  - **success:** Donut wheel with one colored segment per non-archived sector; arc size proportional to `winPercent`; amber pointer at 12 o'clock; purple gradient hub; labels on segments ≥18° arc; fewer than two sectors shows dashed ring and **Add sectors in dashboard**; card, colors, and proportions per `widget-design.md`.

- **CAP-3**
  - **intent:** The overlay animates a wheel spin and lands on the winning sector when a new win appears.
  - **success:** Polling detects a new `latestWin.id`; **SPINNING** badge shows; wheel rotates 5 full turns over 3.8s with `cubic-bezier(0.12, 0.75, 0.1, 1)` and stops with winning `sectorId` under pointer; pointer bounce and hub glow on settle; same win id never re-animated; geometry from `prize-spin-wheel-geometry.ts`; when live session switches, `record.id` change resets animation state.

- **CAP-4**
  - **intent:** The overlay shows the latest winner's nick and prize after the spin completes.
  - **success:** Glass **Winner:** banner slides up with `participantNick` and `sectorLabel`; visible after animation ends or immediately on load when a prior win exists (static rest, no replay); hidden when `latestWin` is null; styling per `widget-design.md`.

- **CAP-5**
  - **intent:** An operator opens the stream overlay from the prize spin session workspace using a fixed URL keyed by Kick channel slug.
  - **success:** Session page header **Overlay** button opens `/prize-spin/widget/{channelSlug}` in a new tab regardless of current session live state; **OBS link** shows **Coming soon** toast (Bonus Buy parity); URL stays constant when operator switches live sessions.

- **CAP-6**
  - **intent:** The system persists account-level widget dimensions shared by all prize spin sessions.
  - **success:** `prize_spin_widget` row per `account_id` with `width`/`height` per `prize-spin-widget.md`; bootstrap on account provision and first `POST .../prize-spins`; lazy insert on widget GET; authenticated `GET`/`PATCH /accounts/:accountId/prize-spin-widget`; public overlay resolves settings via session account.

- **CAP-7**
  - **intent:** An operator adjusts overlay width and height from the session workspace.
  - **success:** **Widget size** opens dialog with **Width** and **Height** fields (200–2400 px); loads account settings on open; valid **Save** PATCHes settings and shows success toast; invalid values show `StatusAlert` in dialog; changes apply to all sessions for the account.

- **CAP-8**
  - **intent:** An operator controls which prize spin session is live for the stream overlay from the session workspace.
  - **success:** When `isActive` is false, **Go live** calls `POST .../go-live`, clears any other live session for the account, and shows a **Live** chip in the header; when `isActive` is true, **Deactivate** calls `POST .../deactivate` and removes the live chip; only one session per account has `isActive: true` at any time; behavior per `live-session-control.md`.

- **CAP-9**
  - **intent:** The public overlay API resolves the live session by Kick `channel_slug` without a session id in the URL.
  - **success:** `GET /prize-spin/widget/:channelSlug` looks up `account_id` from `account_channels` (`provider = 'kick'`, `is_primary = true`, `channel_slug = :channelSlug`) and returns `PrizeSpinWidgetView` for `prize_spin` where `account_id` matches and `is_active = true`; `404` when slug unknown; `409` with `NOT_LIVE` when account exists but no active session; removes legacy `GET /prize-spins/:prizeSpinId/widget` and route `/prize-spin/:id/widget`.

## Constraints

- **English UI** on overlay labels, empty states, warnings, and session header actions per adopted `spec-app-english-only`.
- **Display-only overlay** — spins are initiated from the dashboard (`spec-prize-spin-session-page` CAP-4); viewers do not trigger spins from the widget.
- **Public overlay route** — `/prize-spin/widget/:channelSlug` outside auth shell; no `prize_spin` id and no `accountId` in the URL.
- **Channel slug resolution** — brownfield `account_channels.channel_slug` for primary Kick channel; case-sensitive match as stored (lowercase per Kick OAuth provisioning).
- **Live singleton** — at most one `prize_spin.is_active = true` per `account_id`; enforced in DB transaction on go-live per `live-session-control.md`.
- **Poll interval** — 5000 ms refetch on overlay page (match Bonus Buy stream widget); poll transitions to **No live session.** when session deactivated; picks up new live session when operator switches without URL change.
- **Widget dimensions** — width and height each 200–2400 px; defaults 500×500; overlay reads from DB only — no URL size query params.
- **Sector visuals** — wheel segment fill from `prize_spin_sector.color`; card chrome, pointer, hub, and typography from fixed tokens in `prize-spin-widget-theme.ts` per `widget-design.md`; no theme columns on `prize_spin_widget` in this slice.
- **Overlay card** — dark glass `#0A0A0CE6` with 20px radius and shadow; viewport outside card stays transparent for OBS chroma-key.
- **Brownfield schema** — use existing `prize_spin.is_active` as live flag; add go-live/deactivate endpoints and slug-based public widget route; expose `channelSlug` on auth session for **Overlay** link; update client API per companions.
- **Latest win only** on overlay — no scrollable winner history; full history stays on session page.
- **Session page delta** — replace **End session** / **Ended** with **Go live** / **Deactivate** and **Live** chip; update **Overlay** URL; keep **Widget size** and **OBS link** stub.

## Non-goals

- Full widget theme presets (background, accent palette, border radius) on `prize_spin_widget` — dimensions only in this slice.
- WebSocket, SSE, or signed OBS token for overlay updates.
- Kick chat integration or viewer-triggered participation on the overlay.
- Winner history list, drop statistics, or XLSX export on the overlay page.
- Replay spin animation on page load for an existing `latestWin` — static rest position + banner only.
- Sound effects, particle confetti, or 3D wheel perspective.
- iframe or in-dialog live preview of the overlay inside **Widget size** dialog.
- Numeric `accountId` or `prize_spin` id in public overlay URL.
- Legacy routes `/prize-spin/:id/widget` and `GET /prize-spins/:id/widget`.
- Permanent session archival separate from deactivate — no hard delete; off-air sessions stay editable.

## Success signal

An operator configures OBS once with `/prize-spin/widget/kick_user_mock`, clicks **Go live** on session #12, enters a viewer nick and clicks **Spin** — within one poll cycle the overlay animates and shows the winner. They open session #15, click **Go live** (session #12 deactivates) and spin again — the same OBS URL shows session #15's wheel. They click **Deactivate** — overlay shows **No live session.** on next poll without changing the OBS URL.

## Assumptions

- Wheel segment arc angles are proportional to `winPercent` values (not equal slices).
- Fixed overlay tokens in `prize-spin-widget-theme.ts` scale linearly from a 500×500 base via `scaleForSize`.
- On initial overlay load with an existing `latestWin`, wheel rests on that sector and banner shows without replay animation.
- `latestWin` in the public API is the newest non-archived win (`created_at DESC`).
- `is_active` means live-on-widget (reversible); inactive sessions remain fully editable and can go live again.
- Each account has exactly one primary Kick `channel_slug` in `account_channels`; slug is available on the auth session for building the **Overlay** link.
