# Prize Spin — stream overlay (`/prize-spin/widget/:channelSlug`)

OBS Browser Source surface for the account's **live** prize spin session (`prize_spin.is_active = true`). Fixed URL per Kick channel slug — no session id in the path.

**Visual design:** full token, layout, animation, and component styling in [widget-design.md](widget-design.md).

**Live control:** go-live / deactivate semantics in [live-session-control.md](live-session-control.md).

## Route

| Path | Component | Guards |
|------|-----------|--------|
| `/prize-spin/widget/:channelSlug` | `PrizeSpinStreamWidgetPage` | **Public** — no `ProtectedRoute`, no login redirect |

Register in `App.tsx` as a top-level route **outside** `ProtectedRoute` and `AppShell`. Remove legacy `/prize-spin/:id/widget`.

OBS Browser Source must load the URL without a dashboard session cookie. No sidebar, `PageHeader`, or breadcrumbs.

**URL:** `/prize-spin/widget/{channelSlug}` — e.g. `/prize-spin/widget/kick_user_mock`. No session id; no `accountId`; no `width`/`height` query params.

Resolves live data from `GET /prize-spin/widget/:channelSlug`.

## Empty and warning states

| Condition | Copy | Tone |
|-----------|------|------|
| Unknown `channelSlug` | **Session not found.** | `textMuted` |
| Known account, no `is_active` session | **No live session.** | warning — amber `#F59E0B` or `textMuted` |
| Deactivated during poll | **No live session.** | same as above |

Centered on transparent canvas; no card rendered in warning/error states.

## Data

On mount, read `channelSlug` from `useParams()`; fetch `GET /prize-spin/widget/:channelSlug` (see [prize-spin-widget.md](prize-spin-widget.md)). Use `record`, `sectors`, `latestWin`, and `settings` on success.

**Poll interval:** 5000 ms (match `BonusBuyStreamWidgetPage` `WIDGET_POLL_MS`). Compare `latestWin.id` across polls. When `record.id` changes (operator switched live session), reset animation state. On `NOT_LIVE` during poll, show **No live session.**

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
| Live session switched | New `record.id`; wheel re-renders; no replay unless new win |
| No live session | **No live session.** |

## Session workspace link

`/prize-spin/:id` session header:

| Button | Label | Target |
|--------|-------|--------|
| Go live / Deactivate | per [live-session-control.md](live-session-control.md) | API only |
| Live chip | **Live** | visible when `record.isActive` |
| Overlay | **Overlay** | `/prize-spin/widget/{channelSlug}` (new tab) |
| Widget size | **Widget size** | size dialog per `prize-spin-widget.md` |
| OBS link | **OBS link** | **Coming soon** toast |

## Component structure

| File | Role |
|------|------|
| `app/src/pages/PrizeSpinStreamWidgetPage.tsx` | Route page: parse channelSlug, fetch active session, poll, warning/error states |
| `app/src/components/prize-spin/PrizeSpinWidgetCard.tsx` | Dark glass card: header, pointer, wheel slot, banner |
| `app/src/components/prize-spin/PrizeSpinWheel.tsx` | SVG wheel render + CSS/SVG spin animation |
| `app/src/components/prize-spin/PrizeSpinWinnerBanner.tsx` | Winner pill with slide-in reveal |
| `app/src/lib/prize-spin-wheel-geometry.ts` | Arc angles from `winPercent`; target rotation for `sectorId` |
| `app/src/lib/prize-spin-widget-theme.ts` | Fixed overlay tokens + `scaleForSize(width,height)` helper |
| `app/src/api/prize-spin.ts` | `fetchPublicPrizeSpinWidget(channelSlug)`, go-live/deactivate, widget settings GET/PATCH |
| `app/src/api/auth.ts` | `AuthUser.channelSlug` for Overlay link |

## Out of scope (this companion)

- Full theme/color presets on `prize_spin_widget` (background, accent palette)
- WebSocket, SSE, signed OBS token
- Winner history list on overlay (latest win only)
- Viewer-triggered spin from chat
- URL query param overrides for width/height, accountId, or session id
- iframe preview inside Widget size dialog
- Sound effects and particle confetti
- Legacy `/prize-spin/:id/widget` route and `GET /prize-spins/:id/widget` API
