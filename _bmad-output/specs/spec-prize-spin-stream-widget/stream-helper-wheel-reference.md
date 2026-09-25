# Stream-helper wheel overlay — visual reference

**Source:** [novapointstrix/stream-helper](https://github.com/novapointstrix/stream-helper) — route `/wheel/overlay`, implementation `src/pages/OBSWheelOverlayPage.tsx` (`drawStaticWheel`).

Prize Spin adopts this **wheel** look inside the existing dark glass card (`widget-design.md`). Card chrome, polling, and `winPercent`-proportional arcs stay Caz Agent–specific.

## What to match

| Element | stream-helper behavior | Prize Spin adaptation |
|---------|------------------------|------------------------|
| Sector shape | Full **pie** from center (`moveTo` center → arc → close) | Same; arc size from `winPercent`, not equal slices |
| Sector fill | `sector.color` + linear gloss overlay (white top → transparent mid → black bottom) | Per-sector `prize_spin_sector.color` + same gloss recipe |
| Dividers | White lines center → rim, `rgba(255,255,255,0.28)`, 2px | Same at each sector boundary |
| Outer ring | Double stroke: outer `rgba(255,255,255,0.20)` 5px; inner `rgba(0,0,0,0.20)` 2px inset | Scale with wheel diameter |
| Ambient glow | Faint ring outside wheel `rgba(255,255,255,0.10)` stroke + shadow blur ~22 | Optional soft halo behind wheel in card (no full-viewport blur required) |
| Labels | Bold Arial, white, shadow; radial at ~`(radius - 28)` | `fontFamily` from theme; hide when arc &lt; 18° |
| Hub | Fill `#111318` (r≈39) + `#17191F` (r≈36), stroke `rgba(255,255,255,0.16)` 3px | Same colors; center **RotateCw** icon (module accent), not burger PNG |
| Pointer | Fixed **white** triangle above wheel, `border-t-white`, drop-shadow white glow | Above 12 o'clock; scales with `scaleForSize`; bounce on land unchanged |
| Animation easing | `1 - (1 - t)^4.5` over ~6s, 8 full turns | **Keep** existing 3.8s / 5 turns / `cubic-bezier(0.12, 0.75, 0.1, 1)` per CAP-3 |

## What not to copy

- Supabase broadcast / token URL / show-hide whole overlay lifecycle
- Player pill **«Крутит • name»** above pointer (Prize Spin uses card header + winner banner instead)
- `wheelAudio` tick/win sounds
- Equal sector count math (`360 / n`)
- Premium preset gold rim from `WheelCanvas.tsx` `preset: 'premium'` (different from OBS canvas wheel)

## Implementation files

| File | Role |
|------|------|
| `app/src/components/prize-spin/widget/PrizeSpinWheel.tsx` | SVG pie wheel + pointer |
| `app/src/lib/prize-spin-wheel-visual.ts` | Shared colors, gloss helpers, rim/hub constants aligned to reference |
| `app/src/lib/prize-spin-wheel-geometry.ts` | Arcs, labels, spin math (unchanged contract) |
