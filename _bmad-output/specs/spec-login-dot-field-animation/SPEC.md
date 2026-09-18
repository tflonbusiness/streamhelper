---
id: SPEC-login-dot-field-animation
companions:
  - login-background.md
  - ../spec-app-english-only/conventions.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Caz Agent — Login page Dot Field background

## Why

**Opportunity:** The login screen (`/`, `LoginPage`) is a plain centered card on a flat dark background. Adding the [React Bits Dot Field](https://reactbits.dev/c/backgrounds/dot-field) animation gives the first-touch experience a polished, interactive feel and signals a modern streamer product before OAuth.

**Who:** Unauthenticated visitors about to sign in with Kick.

## Capabilities

- **CAP-1**
  - **intent:** A visitor on the login route sees a full-viewport animated dot-field background behind the existing login card.
  - **success:** At `/` before auth, dot grid fills the viewport; login `Card` with `BrandHeader`, `KickLoginButton`, and feature tiles renders above the background per `login-background.md`.

- **CAP-2**
  - **intent:** Dots react to pointer movement with bulge displacement and a cursor glow matching React Bits DotField behavior.
  - **success:** Moving the mouse over the login page displaces nearby dots away from the cursor and shows a radial glow that follows the pointer; effect matches vendored DotField defaults (`bulgeOnly: true`, `bulgeStrength: 67`).

- **CAP-3**
  - **intent:** All login UI remains fully interactive and readable over the animation.
  - **success:** Kick OAuth button, error `StatusAlert`s, and feature tiles accept clicks; text contrast unchanged; background layer has `pointer-events: none` and lower z-index than `PageShell` content.

- **CAP-4**
  - **intent:** Dot colors align with the Caz Agent dark theme rather than React Bits demo purple defaults.
  - **success:** `gradientFrom`/`gradientTo`/`glowColor` use brand gold and purple from `theme/colors.ts` per prop table in `login-background.md`.

## Constraints

- Vendored DotField in TypeScript + CSS under `app/src/components/backgrounds/` — no `@react-bits` npm package or shadcn CLI install.
- Animation scoped to `LoginPage` only; `PageShell` and authenticated routes unchanged.
- Existing login layout, copy, and OAuth flow preserved (English-only per `conventions.md`).
- `prefers-reduced-motion: reduce` renders a static dot grid without continuous animation.
- `npm run build` in `app/` must pass; no new runtime dependencies.

## Non-goals

- Dot Field on dashboard, team, modules, or any authenticated route.
- User-facing controls to tune dot-field props.
- Installing the full react-bits library or adding Tailwind for this component.
- Changing login copy, OAuth flow, or feature tile content.

## Success signal

Unauthenticated user opens `/` → full-viewport dot grid with brand-tinted gradient → mouse movement bulges dots and shows glow → «Sign in with Kick» click initiates OAuth without hit-target issues → OS reduced-motion on shows static grid → `npm run build` in `app/` passes.

## Assumptions

- Touch devices show the ambient grid; bulge follows `touchmove` when the browser fires pointer events.
- React Bits default motion props (`dotRadius`, `dotSpacing`, `bulgeStrength`) are sufficient before optional sparkle/wave tuning.

## Open Questions

- Enable `sparkle` or `waveAmplitude` for extra ambient motion, or keep both off per `login-background.md` defaults?
