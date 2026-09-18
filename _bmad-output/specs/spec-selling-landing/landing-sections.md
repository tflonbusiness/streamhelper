# Landing sections — page structure

Single-page layout in `landing/index.html`. Sections appear top-to-bottom in DOM order (SEO and no-JS crawlability). Decorative `dot-field.js` sits behind all sections; it must not gate content.

## Section map

| # | ID / anchor | Purpose | Key elements |
|---|-------------|---------|--------------|
| 1 | `hero` | Hook + primary conversion | Logo, benefit H1, lead, primary CTA, secondary text link to `#contact` |
| 2 | `modules` | Product proof — what you get | H2, 3 module cards (Bonus Buy, Prize Spin, Chat Roll) with benefit copy from `landing-copy.md` |
| 3 | `platform` | Differentiators beyond games | H2, 2–3 feature tiles: OBS overlays, Team roles, Kick-native sign-in |
| 4 | `pricing` | Subscription types — conversion without checkout | H2, lead, 3 plan cards (Free, Pro, Studio) per `subscription-plans.md` |
| 5 | `how-it-works` | Reduce friction — show simplicity | H2, 3 numbered steps with short labels |
| 6 | `cta-band` | Repeat conversion before footer | H2, lead, primary CTA duplicate |
| 7 | `contact` | Subscription activation path | H2 or subheading, Telegram link, footer note |

No sticky nav required in MVP. Optional in-page anchor links (`#modules`, `#how-it-works`, `#contact`) in hero secondary link only.

## Layout rules

- **Max content width:** `min(100%, 72rem)` for wide sections; hero column `min(100%, 42rem)` centered.
- **Vertical rhythm:** `4–6rem` section padding on desktop; `2.5–3rem` on mobile.
- **Module grid:** 3 columns ≥768px; 1 column &lt;768px.
- **Pricing grid:** 3 columns ≥768px; 1 column &lt;768px; Pro card may carry accent border or optional "Popular" chip.
- **Platform tiles:** 3 columns ≥520px; stack on narrow mobile.
- **How-it-works:** horizontal 3-step row ≥640px; stacked with step numbers on mobile.
- **CTA band:** full-width card or tinted strip (`--card` background, `--border`) centered in page.

## Visual hierarchy

1. Hero H1 — largest type (`clamp(2rem, 5vw, 3rem)`), benefit-led.
2. Section H2 — `clamp(1.5rem, 3vw, 2rem)`.
3. Card titles — `0.95–1.1rem`, semibold.
4. Body / lead — `--muted-foreground`; leads max ~40ch for hero, ~60ch for section intros.

## CTA styling

- **Primary:** amber fill (`--primary`), dark text, same as current `.cta`.
- **Secondary:** ghost/outline or muted text link; Telegram link opens `https://t.me/parsyuk` in new tab with `rel="noopener noreferrer"`.

## Accessibility

- One `<h1>` in hero only; section titles are `<h2>`.
- Module/platform icons are decorative (`aria-hidden="true"`) when title text carries meaning.
- Focus-visible styles on all links and CTAs.
- `dot-field` container has `aria-hidden="true"`.

## SEO (in `<head>`)

Per `landing-copy.md` — title, description, `og:title`, `og:description`, `og:type` (`website`). No `og:image` requirement unless a share image asset is added later.

## Responsive breakpoint summary

| Breakpoint | Behavior |
|------------|----------|
| &lt;520px | Single-column modules and platform |
| ≥520px | Platform 3-col |
| ≥640px | How-it-works horizontal |
| ≥768px | Modules 3-col |
