---
id: SPEC-app-rename-stream-helper
companions:
  - touchpoints.md
  - brand.md
  - ../spec-app-english-only/scope.md
  - ../spec-app-english-only/conventions.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for audit only.

# Stream Helper — product rename (domain streamhelper.best)

## Why

**Mandate + opportunity:** Production runs at **https://streamhelper.best**; the in-app and landing brand **Stream Widgets** no longer matches the domain or repo (`streamhelper`). Rebrand to **Stream Helper** with the user-supplied S ribbon logo so operators and visitors see one name and one mark that match the public URL and deployment docs. The login screen is the first brand touchpoint for operators.

**Who:** Kick casino streamer operators and landing visitors. **Backdrop:** English-only UI remains (`spec-app-english-only`); this slice changes display name strings, accessibility labels, and logo artwork in `app/` and `landing/`.

## Capabilities

- **CAP-1**
  - **intent:** An operator sees **Stream Helper** as the product name everywhere the app surfaces the brand (document title, login, headers, sidebar logo alternative text).
  - **success:** `app/index.html` title is **Stream Helper**; login and `BrandHeader` show **Stream Helper**; `AppShell` sidebar logo `alt` is **Stream Helper**; no **Stream Widgets** string remains under `app/` per `touchpoints.md`.

- **CAP-2**
  - **intent:** A visitor sees **Stream Helper** on the public landing page in browser chrome, social preview tags, hero branding, body copy, and footer.
  - **success:** `landing/index.html` uses **Stream Helper** in `<title>`, `og:title`, brand name, hero lead, and copyright; tagline after the em dash stays **Kick stream engagement tools**.

- **CAP-3**
  - **intent:** Operators and visitors see the canonical S ribbon logo (yellow–orange gradient, sparkle) wherever `logo.svg` is used, and assistive technologies announce **Stream Helper**.
  - **success:** `app/public/logo.svg` and `landing/logo.svg` match `brand.md` / `logo-reference.png` visually; root `aria-label` is **Stream Helper**; favicon links in both HTML entry points still resolve to `logo.svg`.

- **CAP-4**
  - **intent:** English UI conventions reference **Stream Helper** so future work does not reintroduce **Stream Widgets**.
  - **success:** `conventions.md` (adopted companion) names **Stream Helper** in its product-name guidance.

- **CAP-5**
  - **intent:** On login, an operator sees the Stream Helper mark prominently in the card hero and the official Kick glyph on **Sign in with Kick**.
  - **success:** `LoginPage` renders `/logo.svg` at 64×64 with `alt` **Stream Helper**; `KickLoginButton` renders `/kick-logo-24.png` (24×24, decorative) per `brand.md`; no inline substitute Kick wordmark SVG on that button.

## Constraints

- **Scope** follows `touchpoints.md` for user-facing copy and logo files in `app/` and `landing/`; do not rename Postgres `caz_agent`, Docker defaults, or `localStorage` keys in this slice.
- **Supersedes** display name **Stream Widgets** from `spec-app-rename-stream-widgets`; other English-only rules unchanged.
- **Logo source of truth** is `logo-reference.png` in this spec folder (`brand.md`); deployed `logo.svg` files must render that mark (embedded raster acceptable until a vector trace exists).
- **Kick login asset** is `kick-logo-24.png` in this spec folder, deployed only to `app/public/kick-logo-24.png` for the OAuth button — not for shell navigation.
- **Historical** `_bmad-output` specs are not bulk-rewritten.

## Non-goals

- Database, infrastructure, or internal package renames beyond what deployment already uses (`streamhelper`).
- Retroactive retitling of past BMad specs mentioning Stream Widgets.
- Full brand guidelines deck, wordmark typography, or social banner templates beyond the icon files in `touchpoints.md`.
- i18n or Russian product copy.
- Mock contact strings with legacy `caz-agent` identifiers.

## Success signal

An operator opens `/login`: the card hero shows the S ribbon at 64×64 and **Stream Helper** copy; **Sign in with Kick** shows the green Kick mascot. After sign-in, shell branding still matches CAP-1/CAP-3. A visitor opens `landing/index.html` with the same mark. `rg 'Stream Widgets' app/ landing/` returns no matches.

## Assumptions

- Canonical display name is **Stream Helper** (title case, two words), matching **streamhelper.best**.
- Marketing sentences stay the same except where they literally said **Stream Widgets**.
- SVG may embed the reference PNG until a traced vector is provided.
