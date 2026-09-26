# Stream Helper — brand mark

## Canonical asset

- **Reference file:** `logo-reference.png` (150×150, user-supplied S ribbon with sparkle).
- **Deploy targets:** `app/public/logo.svg` and `landing/logo.svg` must render the same mark (currently SVG wrapper with embedded PNG; vector trace optional later).

## Accessibility

- Root `<svg>`: `role="img"`, `aria-label="Stream Helper"`.
- Favicon: both `app/index.html` and `landing/index.html` link `logo.svg`.

## Palette (approximate, for future vector work)

| Token | Hex | Use |
|-------|-----|-----|
| Ribbon top | `#FFCA28` | Gradient start |
| Ribbon mid | `#FF9800` | Fold highlights |
| Ribbon deep | `#F4511E` | Gradient end, sparkle |
| Canvas | `#000000` | Logo background |

## Out of scope

- Wordmark typography lockups or marketing kit beyond the icon files above.
