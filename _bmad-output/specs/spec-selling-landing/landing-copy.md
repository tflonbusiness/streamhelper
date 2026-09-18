# Landing copy — approved English strings

All user-visible strings for `landing/index.html`. Implementation may tighten wording for fit but must preserve meaning and claims.

## Meta

| Key | Copy |
|-----|------|
| `<title>` | Caz Agent — Kick stream engagement tools |
| `meta description` | Run bonus buys, prize wheels, and chat giveaways on Kick. OBS-ready overlays, team access, one dashboard. Sign in with Kick. |
| `og:title` | Caz Agent — Kick stream engagement tools |
| `og:description` | Interactive modules and stream overlays for Kick casino streamers. Sign in to get started. |

## Hero

| Element | Copy |
|---------|------|
| H1 | Turn your Kick chat into a live game show |
| Lead | Caz Agent gives casino streamers ready-to-run engagement modules — bonus buys, prize wheels, and weighted giveaways — with OBS overlays your viewers see on stream. |
| Primary CTA | Sign in with Kick |
| Secondary link | Get access via Telegram → anchors to `#contact` |

## Modules (`#modules`)

| Element | Copy |
|---------|------|
| H2 | Everything you need to engage chat |
| Section lead | Pick a module, configure it in the dashboard, and drop the browser-source widget into OBS. |

### Bonus Buy card

| Element | Copy |
|---------|------|
| Title | Bonus Buy |
| Body | Run slot bonus-buy sessions on stream. Track balance, open rounds, and show live stats on your overlay while viewers follow the action. |

### Prize Spin card

| Element | Copy |
|---------|------|
| Title | Prize Spin |
| Body | Spin a weighted prize wheel for any viewer nick. Set sectors, odds, and colors — then reveal the winner on stream in seconds. |

### Chat Roll card

| Element | Copy |
|---------|------|
| Title | Chat Roll |
| Body | Weighted chat giveaways with a keyword. Boost odds for VIPs, mods, and subscribers — fair rolls, instant winner on overlay. |

## Platform (`#platform`)

| Element | Copy |
|---------|------|
| H2 | Built for stream production |

### OBS overlays tile

| Element | Copy |
|---------|------|
| Title | OBS-ready widgets |
| Body | Browser-source URLs for each module. Styled to match your dark stream layout. |

### Team tile

| Element | Copy |
|---------|------|
| Title | Team access |
| Body | Owners and moderators share one account. Control who runs games during your stream. |

### Kick tile

| Element | Copy |
|---------|------|
| Title | Kick-native |
| Body | Sign in with Kick OAuth. No extra passwords — start from the channel you already stream on. |

## Pricing (`#pricing`)

Section copy per `subscription-plans.md`. Summary:

| Element | Copy |
|---------|------|
| H2 | Plans for every stream size |
| Lead | Start free, then upgrade when you need more modules, overlays, or team seats. All paid plans are activated via Telegram — no checkout on this page. |
| Footnote | Prices are quoted individually. Message us to pick the right plan for your channel. |

Plan card strings (Free, Pro, Studio) are defined in full in `subscription-plans.md`.

## How it works (`#how-it-works`)

| Element | Copy |
|---------|------|
| H2 | Live in three steps |

| Step | Label | Body |
|------|-------|------|
| 1 | Sign in | Connect with Kick and pick your team. |
| 2 | Configure | Open a module, set prizes, keywords, or sectors in the dashboard. |
| 3 | Go live | Add the widget URL to OBS and run your session while you stream. |

## CTA band

| Element | Copy |
|---------|------|
| H2 | Ready to engage your chat? |
| Lead | Sign in with Kick to open your dashboard, or message us to activate your subscription. |
| Primary CTA | Sign in with Kick |

## Contact (`#contact`)

| Element | Copy |
|---------|------|
| H2 | Activate your plan |
| Body | Sign in with Kick to start on Free. For Pro or Studio, message us on Telegram and we'll set up your team. |
| Telegram CTA | Message @parsyuk on Telegram |
| Footer | © {year} Caz Agent |

Replace `{year}` with current year at implementation time.

## Claims guardrails

- Do **not** mention modules or features not in the app catalog (no "8 games library", no Wheel of Fortune as available if status is not shipped).
- Do **not** state dollar amounts or monthly rates — show plan **types** only (Free, Pro, Studio); prices are quoted via Telegram.
- Do **not** use fake testimonials, viewer counts, or "trusted by X streamers" without real data.
