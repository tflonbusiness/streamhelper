# Stream Helper — brand marks

## Product icon (Stream Helper)

- **Reference file:** `logo-reference.png` (150×150, user-supplied S ribbon with sparkle).
- **Deploy targets:** `app/public/logo.svg` and `landing/logo.svg` must render the same mark (currently SVG wrapper with embedded PNG; vector trace optional later).
- **Login hero:** `LoginPage` uses `/logo.svg` at **64×64** inside the card header (larger than shell chrome icons).

## Kick sign-in glyph

- **Reference file:** `kick-logo-24.png` (24×24, user-supplied Kick mascot).
- **Deploy target:** `app/public/kick-logo-24.png` only — used by `KickLoginButton`, not navigation.

## Accessibility

- Product `logo.svg` root: `role="img"`, `aria-label="Stream Helper"`.
- Login product image: `alt="Stream Helper"`.
- Kick button image: `alt=""` and `aria-hidden` (label is button text).
- Favicon: both `app/index.html` and `landing/index.html` link `logo.svg`.

## Palette (product icon, approximate)

| Token | Hex | Use |
|-------|-----|-----|
| Ribbon top | `#FFCA28` | Gradient start |
| Ribbon mid | `#FF9800` | Fold highlights |
| Ribbon deep | `#F4511E` | Gradient end, sparkle |
| Canvas | `#000000` | Logo background |

## Out of scope

- Wordmark typography lockups or marketing kit beyond the files above.
