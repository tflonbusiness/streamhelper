# Prize Spin — stream overlay (`/modules/prize-spin/:prizeSpinId/widget`)

OBS Browser Source surface for a single prize spin session. The URL includes the session id; the session must be **active** (`prize_spin.status = 'active'`) for widget data.

**Visual design:** card chrome in [widget-design.md](widget-design.md); wheel look from [stream-helper-wheel-reference.md](stream-helper-wheel-reference.md).

**Session status:** `active` vs `archived` per [../spec-prize-spin-history-archive/session-status.md](../spec-prize-spin-history-archive/session-status.md).

## Route

| Path | Component | Guards |
|------|-----------|--------|
| `/modules/prize-spin/:prizeSpinId/widget` | `PrizeSpinStreamWidgetPage` | **Public** — no `ProtectedRoute`, no login redirect |

Register in `App.tsx` as a top-level route **outside** `ProtectedRoute` and `AppShell`. Remove `/modules/prize-spin/widget/:ucid` and legacy `/prize-spin/:id/widget`.

OBS Browser Source must load the URL without a dashboard session cookie. No sidebar, `PageHeader`, or breadcrumbs.

**URL:** `/modules/prize-spin/{prizeSpinId}/widget` — e.g. `/modules/prize-spin/1/widget`. No `channelSlug`, `ucid`, or `accountId`; no `width`/`height` query params.

Resolves widget data from `GET /prize-spins/:prizeSpinId/widget`.

## Empty and warning states

| Condition | Copy | Tone |
|-----------|------|------|
| Unknown `prizeSpinId` | **Session not found.** | `textMuted` |
| Known session, `status = 'archived'` | **Session not found.** | `textMuted` |

Centered on transparent canvas; no card rendered in warning/error states.

## Data

On mount, read `prizeSpinId` from `useParams()`; fetch `GET /prize-spins/:prizeSpinId/widget` (see [prize-spin-widget.md](prize-spin-widget.md)). Use `record`, `sectors`, `latestWin`, and `settings` on success.

**Poll interval:** 5000 ms (match `BonusBuyStreamWidgetPage` `WIDGET_POLL_MS`). Compare `latestWin.id` across polls. When `record.id` changes (different route param), reset animation state. On `404` during poll (e.g. session archived), show **Session not found.**

Loading: purple spinner on transparent canvas per `widget-design.md`.

## Canvas

| Property | Source |
|----------|--------|
| Viewport | Transparent `min-h-svh`; OBS chroma-key friendly |
| Card | `settings.width` × `settings.height` px; dark glass card per `widget-design.md` |
| Background outside card | Transparent |
| Font | `prize-spin-widget-theme.ts` → `Inter, system-ui, sans-serif` |

## Layout

```
PrizeSpinWidgetCard (settings.width × settings.height)
  HeaderBar              ← icon + "Prize Spin #{id}" + SPINNING badge when animating
  Pointer                ← fixed amber chevron at 12 o'clock
  PrizeSpinWheel         ← SVG donut wheel; sectors from API
  WinnerBanner           ← glass pill; nick + prize after spin or on static load
```

Proportions, colors, typography, and animation timing: [widget-design.md](widget-design.md).

## Behavior summary

| Event | UI |
|-------|-----|
| New `latestWin.id` from poll | Hide banner → **SPINNING** badge → 5-rev spin 3.8s → pointer bounce → banner reveal |
| Load with existing win | Static wheel on sector + banner visible; no replay |
| Load, no wins | Header + idle wheel (expanded diameter) |
| `< 2` sectors | Dashed ring + **Add sectors in dashboard** |
| Same win id on poll | No re-animation |
| Session deactivated | **No live session.** |

## Session workspace link

`/modules/prize-spin/:id` — **Stream Widget** card (not on history page):

| Control | Label | Target / behavior |
|---------|-------|-------------------|
| Widget settings | **Widget settings** | Dialog — width/height per `prize-spin-widget.md` |
| Open overlay | **Open overlay** | `/modules/prize-spin/{id}/widget` (new tab) |
| OBS link | **OBS link** | Copy `window.location.origin` + same path |

Session header (separate from Stream Widget card):

| Button | Label | Target |
|--------|-------|--------|
| Go live / Deactivate | per [live-session-control.md](live-session-control.md) | API only |
| Live chip | **Live** | visible when `record.isActive` |

## Component structure

| File | Role |
|------|------|
| `app/src/pages/PrizeSpinStreamWidgetPage.tsx` | Route page: parse `prizeSpinId`, fetch session widget, poll, warning/error states |
| `app/src/lib/routes.ts` | `prizeSpinWidgetRoute(id)` → `/modules/prize-spin/:id/widget` |
| `app/src/components/prize-spin/widget/PrizeSpinWidgetCard.tsx` | Dark glass card: header, pointer, wheel slot, banner |
| `app/src/components/prize-spin/widget/PrizeSpinWheel.tsx` | SVG wheel render + CSS/SVG spin animation |
| `app/src/components/prize-spin/widget/PrizeSpinWinnerBanner.tsx` | Winner pill with slide-in reveal |
| `app/src/components/prize-spin/session/PrizeSpinStreamWidgetSection.tsx` | Stream Widget card on **session** page only |
| `app/src/lib/prize-spin-wheel-geometry.ts` | Arc angles from `winPercent` or equal slices per `settings.equalSectorSlices`; target rotation for `sectorId` |
| `app/src/lib/prize-spin-widget-theme.ts` | Fixed overlay tokens + `scaleForSize(width,height)` helper |
| `app/src/api/prize-spin.ts` | `fetchPublicPrizeSpinWidget(prizeSpinId)`, go-live/deactivate, widget settings GET/PATCH |

## Out of scope (this companion)

- Full theme/color presets on `prize_spin_widget` (background, accent palette)
- WebSocket, SSE, signed OBS token
- Winner history list on overlay (latest win only)
- Viewer-triggered spin from chat
- URL query param overrides for width/height or accountId
- iframe preview inside Widget settings dialog
- Sound effects and particle confetti
- `GET /prize-spins/widget/:ucid` and `/modules/prize-spin/widget/:ucid`
- Stream Widget section on `/modules/prize-spin` history page
