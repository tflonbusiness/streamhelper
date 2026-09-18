---
id: SPEC-selling-landing
companions:
  - landing-sections.md
  - landing-copy.md
  - subscription-plans.md
  - ../spec-caz-agent-ui-improvement/design-tokens.md
  - ../spec-app-english-only/conventions.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Caz Agent — Selling landing page

## Why

**Opportunity:** The public landing at `landing/index.html` is a minimal hero — product name, one generic sentence, and three vague feature tiles. It does not sell the value of shipped modules (Bonus Buy, Prize Spin, Chat Roll), the OBS overlay workflow, or the path to sign in. Kick casino streamers who land here before OAuth get no reason to click through. Updating the landing to a benefit-led, conversion-focused single page closes the gap between product capability and first impression without building a separate marketing site.

## Capabilities

- **CAP-1**
  - **intent:** A visitor immediately understands that Caz Agent is for Kick streamers who want chat engagement and on-stream overlays, not just an "operator dashboard."
  - **success:** Hero shows benefit-led H1 and lead copy from `landing-copy.md` (outcome before product name); a reviewer who has never seen the app can state the target user and core value in one sentence after 5 seconds on the page.

- **CAP-2**
  - **intent:** A visitor sees what the product actually ships — Bonus Buy, Prize Spin, and Chat Roll — with benefit-oriented descriptions and an OBS overlay mention.
  - **success:** `#modules` section renders three cards matching `landing-copy.md`; each card names a real module from `app/src/lib/modules.ts`; no card references unshipped or retired catalog items.

- **CAP-3**
  - **intent:** A visitor understands how to go from discovery to a live stream in three clear steps.
  - **success:** `#how-it-works` section shows numbered steps Sign in → Configure → Go live with copy from `landing-copy.md`; steps are visible without JavaScript.

- **CAP-4**
  - **intent:** A visitor has an obvious primary action (Kick sign-in) and a secondary path to request subscription access.
  - **success:** Hero and CTA band each contain a primary link to `../app/` labeled **Sign in with Kick**; `#contact` section links to `https://t.me/parsyuk` with visible **Message @parsyuk on Telegram** copy.

- **CAP-5**
  - **intent:** Search engines and link previews receive accurate English metadata for the selling positioning.
  - **success:** `<html lang="en">`; `<title>`, `meta description`, `og:title`, and `og:description` match `landing-copy.md`; page has exactly one `<h1>`; all section content is in static HTML (crawlable without executing scripts).

- **CAP-6**
  - **intent:** A visitor perceives Caz Agent as one cohesive product before entering the app — same brand, palette, and motion as the login experience.
  - **success:** Logo, Inter font, and token values from adopted `design-tokens.md` match `app/` login; `dot-field.js` decorative background present; side-by-side review of landing hero and login page shows aligned colors and typography.

- **CAP-7**
  - **intent:** A visitor sees multiple subscription types (Free, Pro, Studio) and understands how to start free vs. request a paid upgrade.
  - **success:** `#pricing` section renders three plan cards per `subscription-plans.md`; Free points to sign-in; Pro and Studio point to `#contact`; no dollar amounts on page; footnote states prices are quoted via Telegram.

## Constraints

- **Single static page** — all content in `landing/index.html`; no new routes, no React, no build step for landing.
- **English only** — per adopted `conventions.md`; `lang="en"`.
- **Truthful claims** — copy may only describe shipped modules and features (Bonus Buy, Prize Spin, Chat Roll, team roles, OBS browser-source widgets, Kick OAuth). No fabricated metrics or logos.
- **Subscription tiers** — landing shows exactly three plan types (Free, Pro, Studio) per `subscription-plans.md`; no dollar amounts or checkout; paid activation via Telegram only.
- **Primary CTA** — `<a href="../app/">` with **Sign in with Kick**; no JavaScript redirect.
- **Subscription contact** — Telegram `@parsyuk` / `https://t.me/parsyuk`; no payment checkout on landing.
- **Design tokens** — dark theme, amber accent, Inter — per adopted `design-tokens.md`; section structure per `landing-sections.md`.
- **Copy source of truth** — user-visible strings from `landing-copy.md`; implementation may shorten for layout but not change claims.
- **Dot-field background required** — `landing/dot-field.js` stays loaded for brand parity with the login page; JS is decorative only — all sections, CTAs, and SEO content must render fully with JS disabled.
- **Supersedes minimal hero** — replaces the CAP-6 "centered hero only" content scope in `spec-caz-agent-ui-improvement` for landing structure; token and brand rules from that spec still apply.

## Non-goals

- Multi-page marketing site (blog, docs, changelog, pricing page).
- In-app checkout, Stripe, or dollar amounts on landing (plan **types** only).
- Fake social proof (testimonials, viewer counts, partner logos without real assets).
- i18n or Russian copy on landing.
- Analytics or tracking scripts (add only when explicitly requested).
- Mentioning the eight-game CasinoStream library as if it were live in Caz Agent.

## Success signal

A Kick streamer opens `landing/` → reads the hero and module cards → compares Free / Pro / Studio plans → understands Bonus Buy / Prize Spin / Chat Roll and OBS widgets → clicks **Sign in with Kick** into `app/` without confusion. View Page Source shows full section HTML and meta tags with zero Cyrillic. With JS disabled, all seven sections and both CTAs remain visible and clickable. Lighthouse SEO score ≥ 90 on the landing URL.

## Assumptions

- No verified customer logos or usage metrics exist yet — social proof section is omitted until real data is provided.
- Landing shows three plan **types** (Free, Pro, Studio) without dollar amounts; individual pricing quoted via Telegram (user decision).
- `dot-field.js` stays on landing for brand parity with the login page (user decision).
- Logo asset continues to be shared between `landing/` and `app/` (e.g. `logo.svg`).
- Plan tier names (`pro`, `studio`) are marketing-facing; backend may only implement `free` today — paid tiers are activated manually via support until billing ships.
