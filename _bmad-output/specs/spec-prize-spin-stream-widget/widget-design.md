# Prize Spin — overlay visual design

Stream-overlay look for `/modules/prize-spin/:prizeSpinId/widget`. Dark glass **card** aligned with Caz Agent tokens (`design-tokens.md`) and Prize Spin module purple (`colors.purple`). **Wheel** styling matches [stream-helper `/wheel/overlay`](https://github.com/novapointstrix/stream-helper) (`stream-helper-wheel-reference.md`). Sector fill colors always come from `prize_spin_sector.color`.

**Warning state (no card):** centered **No live session.** — 16px/500, amber `#F59E0B` or `textMuted`; transparent canvas. Distinct from **Session not found.** (`textMuted` only).

## Design intent

- **Hero:** the wheel dominates the card — viewers recognize a game-show spin instantly.
- **Contrast:** dark glass card + bright sector colors + white wheel pointer (stream-helper) + purple module chrome on header/hub icon.
- **OBS-safe:** outer viewport stays transparent; only the card and its contents are opaque. No full-screen tint.

## Fixed tokens (not in DB this slice)

| Token | Value | Usage |
|-------|-------|-------|
| `cardBg` | `#0A0A0CE6` (90% opacity) | Card background — slight transparency for soft edge on stream |
| `cardBorder` | `#2F2F31` | Card 1px border |
| `cardRadius` | `20px` | Card corners |
| `cardShadow` | `0 8px 32px rgba(0,0,0,0.45)` | Depth on stream |
| `surface` | `#121215` | Header strip, hub inner, winner pill bg |
| `moduleAccent` | `#A78BFA` | Header icon, prize text, hub glow |
| `moduleAccentGlow` | `rgba(167,139,250,0.35)` | Hub ring pulse on win |
| `wheelPointerFill` | `#FFFFFF` | Wheel pointer triangle (stream-helper) |
| `wheelPointerGlow` | `0 3px 10px rgba(255,255,255,0.55)` | Pointer drop shadow |
| `textPrimary` | `#FFFFFF` | Titles, winner nick |
| `textMuted` | `#9CA3AF` | **Winner:** prefix, empty state |
| `divider` | `rgba(255,255,255,0.12)` | Segment separators |
| `fontFamily` | `Inter, system-ui, sans-serif` | All overlay text |

Constants live in `app/src/lib/prize-spin-widget-theme.ts` (overlay-only; not persisted).

## Card layout (default 800×800)

Proportions scale linearly when `settings.width` / `height` change. Base math at 800×800 account default:

```
┌──────────────────────────────────────┐  cardRadius 20, padding 16
│  [icon] Prize Spin #12        LIVE?  │  header 44px
│                                      │
│            ▼ pointer                 │  pointer overhangs 12px above wheel
│         ╭─────────╮                  │
│        │  wheel    │                 │  wheel diameter = min(w,h) - 16 - 44 - 80 - 32
│        │  wheel    │                 │  diameter from min(w,h) minus header/banner reserves; tokens scale via baseSize 800 × (min/800)
│         ╰─────────╯                  │
│                                      │
│  ┌────────────────────────────────┐  │  winner banner 72px (when visible)
│  │ Winner:  viewer_nick  ·  Prize   │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

| Zone | Height formula | Notes |
|------|----------------|-------|
| Card padding | `16px` all sides | Fixed |
| Header | `44px` | Icon + title row |
| Gap header→wheel | `8px` | |
| Wheel | `cardInnerHeight - header - gap - bannerReserve` | Circular, centered horizontally |
| Banner reserve | `80px` when `latestWin` or animating; `0` when no wins yet | Banner slides into this space |
| Gap wheel→banner | `8px` | |

When no `latestWin` and not spinning, wheel expands into banner reserve (wheel ~672px at 800×800 default).

## Header bar

| Element | Spec |
|---------|------|
| Layout | Flex row, align center, gap `10px` |
| Icon | `RotateCw` 28×28, `moduleAccent`, subtle `drop-shadow(0 0 8px moduleAccentGlow)` |
| Title | `Prize Spin #{id}`, 16px/600, `textPrimary`, letter-spacing `-0.01em` |
| Spinning badge | During animation only: right-aligned pill **SPINNING** — 10px/700 uppercase, `moduleAccent` on `surface`, border `divider`, radius `8px`, padding `4px 8px` |

No session title from `record.title` on overlay — id is enough for OBS debugging.

## Pointer (12 o'clock)

Fixed above wheel center; does not rotate. Matches stream-helper OBS wheel overlay (white triangle, not card amber).

| Property | Value |
|----------|-------|
| Shape | Inverted triangle pointing into wheel |
| Size | 20px wide × 20px tall at 500px base (scale with card) |
| Position | Centered on wheel top; sits between header and wheel like stream-helper |
| Fill | `wheelPointerFill` |
| Shadow | `wheelPointerGlow` |

**Land bounce:** on animation end, pointer scales `1 → 1.1 → 1` over 300ms.

## Wheel

SVG in `PrizeSpinWheel.tsx` — visual parity with stream-helper `drawStaticWheel` (`stream-helper-wheel-reference.md`). Single rotating `<g>` for spin animation.

### Geometry

| Property | Rule |
|----------|------|
| Segments | **Pie** from center; arcs from `prize-spin-wheel-geometry.ts`; equal `360°/n` when `equalSectorSlices`, else ∝ `winPercent` |
| Start angle | First sector at 12 o'clock (−90° SVG), clockwise |
| Outer radius | `(wheelDiameter / 2) - 24` at 500px base (scale `rimInset`) |
| Segment fill | `sector.color` ?? `defaultSectorColor(sortOrder)` |
| Gloss overlay | Linear white→transparent→black on each sector (reference recipe) |
| Dividers | Center to rim, `rgba(255,255,255,0.28)`, 2px |
| Outer rings | Outer stroke `rgba(255,255,255,0.20)` 5px; inner inset `rgba(0,0,0,0.20)` 2px |
| Ambient halo | Soft outer ring `rgba(255,255,255,0.10)` + blur behind wheel (subtle) |

### Labels

| Property | Rule |
|----------|------|
| Show when | Arc ≥ 18° |
| Font | 12–17px/800 `fontFamily`, `#FFFFFF` |
| Shadow | `0 0 6px rgba(0,0,0,0.55)` |
| Position | ~`(outerRadius - 28)` along sector mid-angle |
| Rotation | Upright-readable (flip in lower half) |
| Truncate | Max 14 chars + ellipsis |

### Hub (center cap)

| Property | Value |
|----------|-------|
| Outer disc | r ≈ 39px at 480px wheel — fill `#111318`, shadow blur |
| Inner disc | r ≈ 36px — fill `#17191F`, stroke `rgba(255,255,255,0.16)` 3px |
| Center icon | `RotateCw` ~24px, `moduleAccent` (no custom stream PNG) |

No gold rim band, studs, or purple gradient hub — those are superseded by stream-helper styling.

### Empty state (< 2 sectors)

Replace wheel with dashed ring (same diameter), stroke `divider`, 2px dash. Center text **Add sectors in dashboard**, 14px `textMuted`, max-width 70% centered.

## Spin animation

| Phase | Duration | Behavior |
|-------|----------|----------|
| Trigger | — | New `latestWin.id` detected; hide winner banner; show **SPINNING** badge |
| Spin | 3800ms | `cubic-bezier(0.12, 0.75, 0.1, 1)` rotation: `baseRotations * 360° + targetOffset` where `baseRotations = 5` full turns |
| Settle | 300ms | Pointer bounce only |
| Reveal | 400ms | Winner banner slides up 16px + fade in; **SPINNING** badge hides |

**Target offset:** rotation that places winning sector's mid-angle under the pointer (12 o'clock).

**Same win id:** never re-animate.

**Initial page load with existing win:** static wheel at rest on winning sector; banner visible immediately; no spin replay.

## Winner banner

Glass pill below wheel.

| Property | Value |
|----------|-------|
| Container | `surface` bg, 1px `cardBorder`, radius `14px`, padding `12px 16px`, min-height `56px` |
| Layout | Single row, flex, align center, gap `8px`, wrap on narrow widths |
| Prefix | **Winner:** 13px/500 `textMuted` |
| Nick | `participantNick`, 18px/700 `textPrimary`, truncate with ellipsis |
| Separator | `·` 14px `textMuted` |
| Prize | `sectorLabel`, 16px/600 `moduleAccent`, truncate |

**Win glow:** optional 600ms radial gradient behind banner (`moduleAccentGlow`, fades out) on reveal — subtle, not confetti.

## Loading & error

| State | UI |
|-------|-----|
| Loading | 32px `CircularProgress` color `moduleAccent` on transparent canvas |
| Not found | **Session not found.** 16px `textMuted`, centered |

## Responsive scaling

All px values scale by `scale = min(settings.width, settings.height) / 500`. Apply to font sizes, pointer, hub, padding, and wheel diameter. Minimum scale 0.4 (200px box) — below that, hide segment labels and show colors only.

## ASCII — spin sequence

```
Idle                    Spinning (t=2s)              Revealed
┌─────────────┐         ┌─────────────┐              ┌─────────────┐
│ Prize Spin  │         │ Prize Spin  SPINNING      │ Prize Spin  │
│      ▼      │         │      ▼      │              │      ▼      │
│   ╭─────╮   │  ──►    │   ╭↻───╮   │   ──►        │   ╭─────╮   │
│   │     │   │         │   │ ⟳  │   │              │   │ ★win│   │
│   ╰─────╯   │         │   ╰─────╯   │              │   ╰─────╯   │
│             │         │             │              │ Winner: nick│
└─────────────┘         └─────────────┘              └─────────────┘
```

## Out of scope

- Sound effects, particle confetti, 3D perspective tilt
- Per-account color theme overrides (fixed tokens above)
- Sector icons or images inside segments (hub uses module icon only)
- stream-helper center burger / `stream_icon` assets
- Premium gold `WheelCanvas` rim preset (different product surface)
