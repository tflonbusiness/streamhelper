# Prize Spin — stream overlay (`/prize-spin/:id/widget`)

OBS Browser Source surface for a single prize spin session. Operators preview from the session workspace; OBS loads the same URL.

**Visual design:** full token, layout, animation, and component styling in [widget-design.md](widget-design.md).

## Route

| Path | Component | Guards |
|------|-----------|--------|
| `/prize-spin/:id/widget` | `PrizeSpinStreamWidgetPage` | **Public** — no `ProtectedRoute`, no login redirect |

Register in `App.tsx` as a top-level route **outside** `ProtectedRoute` and `AppShell`. OBS Browser Source must load the URL without a dashboard session cookie. No sidebar, `PageHeader`, or breadcrumbs.

**URL:** `/prize-spin/:id/widget` only — no `width`, `height`, `w`, or `h` query params. Size comes from `prize_spin_widget.width` / `height` via public API.

`:id` loads live data from `GET /prize-spins/:id/widget`. Unknown id → centered **Session not found.** on transparent canvas.

## Data

On mount, fetch `GET /prize-spins/:prizeSpinId/widget` (see [prize-spin-widget.md](prize-spin-widget.md)). Use `record`, `sectors`, `latestWin`, and `settings`.

**Poll interval:** 5000 ms (match `BonusBuyStreamWidgetPage` `WIDGET_POLL_MS`). Compare `latestWin.id` across polls to detect new spins.

Loading: purple spinner on transparent canvas per `widget-design.md`. Error / 404: **Session not found.**

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

## Session workspace link

`/prize-spin/:id` session header:

| Button | Label | Target |
|--------|-------|--------|
| Overlay | **Overlay** | `/prize-spin/:id/widget` (same tab) |
| Widget size | **Widget size** | size dialog per `prize-spin-widget.md` |
| OBS link | **OBS link** | **Coming soon** toast |

## Component structure

| File | Role |
|------|------|
| `app/src/pages/PrizeSpinStreamWidgetPage.tsx` | Route page: fetch, poll, transparent canvas shell |
| `app/src/components/prize-spin/PrizeSpinWidgetCard.tsx` | Dark glass card: header, pointer, wheel slot, banner |
| `app/src/components/prize-spin/PrizeSpinWheel.tsx` | SVG wheel render + CSS/SVG spin animation |
| `app/src/components/prize-spin/PrizeSpinWinnerBanner.tsx` | Winner pill with slide-in reveal |
| `app/src/lib/prize-spin-wheel-geometry.ts` | Arc angles from `winPercent`; target rotation for `sectorId` |
| `app/src/lib/prize-spin-widget-theme.ts` | Fixed overlay tokens + `scaleForSize(width,height)` helper |
| `app/src/api/prize-spin.ts` | `fetchPublicPrizeSpinWidget`, widget settings GET/PATCH |

## Out of scope (this companion)

- Full theme/color presets on `prize_spin_widget` (background, accent palette)
- WebSocket, SSE, signed OBS token
- Winner history list on overlay (latest win only)
- Viewer-triggered spin from chat
- URL query param overrides for width/height
- iframe preview inside Widget size dialog
- Sound effects and particle confetti
