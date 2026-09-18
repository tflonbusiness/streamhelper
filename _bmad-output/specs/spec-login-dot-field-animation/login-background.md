# Login page — Dot Field background

Reference: [React Bits Dot Field](https://reactbits.dev/c/backgrounds/dot-field) (MIT, DavidHDev/react-bits).

## Component placement

```
LoginPage
├── DotFieldBackground (fixed inset-0, z-index 0, pointer-events: none)
└── PageShell (relative z-index 1, existing card unchanged)
```

Mount `DotFieldBackground` inside `LoginPage` only — not in `PageShell`, so authenticated routes stay unaffected.

## Vendored component

Copy `DotField` from react-bits `src/content/Backgrounds/DotField/` into:

- `app/src/components/backgrounds/DotField.tsx`
- `app/src/components/backgrounds/DotField.css`

Port JSX → TypeScript: typed props interface, `memo` wrapper, `displayName`. Keep canvas + SVG glow structure and `requestAnimationFrame` loop unchanged.

## Default props (brand-tuned)

| Prop | Value | Rationale |
| --- | --- | --- |
| `dotRadius` | `1.5` | React Bits default |
| `dotSpacing` | `14` | React Bits default |
| `cursorRadius` | `500` | React Bits default |
| `bulgeOnly` | `true` | Bulge-away cursor effect |
| `bulgeStrength` | `67` | React Bits default |
| `glowRadius` | `160` | React Bits default |
| `sparkle` | `false` | Subtle login screen |
| `waveAmplitude` | `0` | No ambient wave until user opts in |
| `gradientFrom` | `rgba(240, 160, 32, 0.35)` | `colors.brand[500]` at 35% |
| `gradientTo` | `rgba(167, 139, 250, 0.25)` | `colors.purple[500]` at 25% |
| `glowColor` | `#0B0B0F` | `colors.neutral[950]` — matches page bg |

## Layering and accessibility

- Container: `position: fixed; inset: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; z-index: 0`.
- Page base bg `colors.neutral[950]` remains on `body`/theme; dots render on top of it.
- `@media (prefers-reduced-motion: reduce)`: skip `requestAnimationFrame` loop; render one static dot grid frame on mount (no bulge, no glow follow).
- Canvas `devicePixelRatio` capped at 2 (inherited from source).

## Verification checklist

1. Open `/` unauthenticated → dot grid visible full viewport.
2. Move mouse → dots bulge away from cursor; subtle glow follows pointer.
3. Click «Sign in with Kick» → button receives click (background does not intercept).
4. Resize window → grid reflows without gaps.
5. Enable reduced motion in OS → static grid, no continuous animation.
6. `npm run build` in `app/` passes.
