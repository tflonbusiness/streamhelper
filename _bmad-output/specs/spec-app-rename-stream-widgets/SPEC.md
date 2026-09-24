---
id: SPEC-app-rename-stream-widgets
companions:
  - touchpoints.md
  - ../spec-app-english-only/scope.md
  - ../spec-app-english-only/conventions.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for audit only.

# Stream Widgets — product rename (from Caz Agent)

## Why

**Mandate + opportunity:** The product is rebranding from **Caz Agent** to **Stream Widgets** so the name matches what operators get — stream overlays and engagement widgets — rather than an agent metaphor. Operators and visitors must see one consistent English product name in the live app and marketing landing.

**Who:** Kick casino streamer operators (dashboard) and landing visitors. **Backdrop:** English-only UI is already in force (`spec-app-english-only`); this slice changes only the brand string and related accessibility labels, not locale or feature scope.

## Capabilities

- **CAP-1**
  - **intent:** An operator sees **Stream Widgets** as the product name everywhere the app surfaces the brand (document title, login, headers, sidebar logo alternative text).
  - **success:** After build, `app/index.html` title is **Stream Widgets**; login and `BrandHeader` show **Stream Widgets**; `AppShell` sidebar logo `alt` is **Stream Widgets**; no **Caz Agent** string remains under `app/` per `touchpoints.md`.

- **CAP-2**
  - **intent:** A visitor sees **Stream Widgets** on the public landing page in browser chrome, social preview tags, hero branding, body copy, and footer.
  - **success:** `landing/index.html` uses **Stream Widgets** in `<title>`, `og:title`, brand name, hero lead, and copyright; tagline after the em dash stays **Kick stream engagement tools**.

- **CAP-3**
  - **intent:** Assistive technologies announce the logo as **Stream Widgets**.
  - **success:** `app/public/logo.svg` root `aria-label` is **Stream Widgets**.

- **CAP-4**
  - **intent:** English UI conventions reference the new product name so future work does not reintroduce **Caz Agent**.
  - **success:** `conventions.md` (adopted companion) no longer names **Caz Agent** in its product-name guidance.

## Constraints

- **Scope** follows `scope.md` paths for user-facing copy: `app/`, `landing/`, plus `touchpoints.md` for exact files; do not rename Postgres `caz_agent`, Docker env defaults, or `localStorage` keys in this slice.
- **Supersedes** the “brand stays **Caz Agent**” constraint in `spec-app-english-only` **for product naming only**; all other English-only rules remain.
- **Reuse** the existing `logo.svg` graphic; update text and `aria-label`/`alt` only unless a separate design spec is opened.
- **Historical** `_bmad-output` specs and epics are not bulk-rewritten; they remain audit references.

## Non-goals

- Database, infrastructure, or URL slug renames (`caz_agent`, `caz-agent-dev`, etc.).
- Retroactive retitling of every past BMad spec or epic filename.
- New logo artwork or wordmark design.
- i18n, locale switching, or Russian copy.
- Mock/demo contact strings (`pay@caz-agent.example`, `@caz_agent_mock`, and similar) — keep legacy `caz-agent` identifiers.
- Renaming internal package names, repo slugs, or deployment hostnames that contain `caz-agent`.

## Success signal

An operator opens login and the signed-in shell; a visitor opens `landing/index.html`. Both see **Stream Widgets** with no visible **Caz Agent**. `rg 'Caz Agent' app/ landing/ app/public/logo.svg` returns no matches, and `npm run build` in `app/` still passes.

## Assumptions

- Canonical display name is **Stream Widgets** (title case, two words).
- Marketing sentences stay the same except where they literally said **Caz Agent**.
