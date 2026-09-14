---
id: SPEC-caz-agent-ui-improvement
companions:
  - design-tokens.md
  - components.md
  - surfaces.md
  - ../../implementation-artifacts/epic-1-context.md
  - ../../implementation-artifacts/epic-2-context.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Caz Agent — UI design improvement

## Why

**Pain:** Epic 1 and 2 shipped functional auth, onboarding, and team flows in `app/`, but the UI is a bare MVP — generic dark panels, no shared design system, conflicting global styles (`index.css` Vite scaffold vs `App.css`), and a landing page with unrelated typography. Operators see a product that works but does not feel intentional or trustworthy. The opportunity is to raise visual quality and consistency across all seven app routes and `landing/` without changing product behavior.

## Capabilities

- **CAP-1**
  - **intent:** A user sees a unified Caz Agent visual identity (color, typography, spacing) on every `app/` route and on `landing/`.
  - **success:** Side-by-side review of login, dashboard, contact, and landing shows the same token values from `design-tokens.md` (stream-helper `main` palette: `#0A0A0C` bg, `#F59E0B` accent); shadcn theme variables in `globals.css` are the source of truth for `app/`; landing mirrors those values.

- **CAP-2**
  - **intent:** A user interacts with consistent UI primitives — buttons, inputs, panels, badges, alerts, dialogs — with visible focus, hover, disabled, and error states.
  - **success:** Each shadcn component mapped in `components.md` is installed under `app/src/components/ui/` and used on **every** current and future `app/` route; no raw unstyled `<button>` or `<input>` remain on pages; overlays and focus-managed UI use Radix-backed shadcn components (e.g. `Dialog`), not hand-rolled modals.

- **CAP-3**
  - **intent:** A user can complete auth and account flows on mobile (320px) and desktop without layout breakage or horizontal scroll.
  - **success:** At 320px and 1280px viewport widths, all seven routes render without overflow-x; forms and account picker remain usable without zoom.

- **CAP-4**
  - **intent:** A user perceives clear page hierarchy — title, lead, primary action, secondary actions — on every app route defined in `surfaces.md`.
  - **success:** Each route matches its surface spec: one H1, one lead paragraph, primary CTA visually dominant, secondary actions de-emphasized.

- **CAP-5**
  - **intent:** A user with keyboard or screen reader gets labeled forms, associated errors, and logical focus order on auth and team-management forms.
  - **success:** Tab through login, register, onboarding create, and add-admin forms hits controls in DOM order; shadcn `Alert` for errors; shadcn `Label` + `Input` on every field.

- **CAP-6**
  - **intent:** A visitor on `landing/` recognizes the same brand before entering `app/` via hero layout with logo, headline, description, and CTA.
  - **success:** Landing shows centered logo, H1, one description paragraph, and a prominent CTA link to `app/`; styling matches app login; page is crawlable static HTML with no JavaScript.

- **CAP-7**
  - **intent:** The `app/` project has shadcn/ui initialized with Tailwind CSS and the component library wired for Vite + React 19.
  - **success:** `npx shadcn@latest init` (or equivalent) completes; `components.json` exists; `@/` path alias resolves; `globals.css` replaces Vite scaffold `index.css`; build passes.

- **CAP-8**
  - **intent:** A user sees the Caz Agent logo on auth surfaces, dashboard, and landing alongside the product name.
  - **success:** Logo image renders on login, register, dashboard header, and landing hero; same asset file reused across `app/` and `landing/`; alt text is «Caz Agent».

## Constraints

- **Project-wide UI stack** — all current and future React UI in `app/` (every route, epic, and feature spec) uses shadcn/ui on `@radix-ui/*`; feature specs adopt this spec's `components.md` and `design-tokens.md` instead of alternate UI libraries.
- **UI stack is shadcn/ui on Radix** — Tailwind CSS + `@radix-ui/*` primitives; components live in `app/src/components/ui/` and are owned by the repo.
- **Radix for interactive UI** — dialog, label, slot/asChild, dropdown, tabs, popover, switch, separator, and similar focus-managed patterns must wrap `@radix-ui/*` via shadcn (`npx shadcn@latest add …`); no bespoke overlay, focus-trap, or roving-focus markup.
- **Maximize shadcn composition** — pages use mapped components and shared wrappers (`PageHeader`, `BrandHeader`) per `components.md`; avoid raw headings, muted spans, and toggle buttons where a mapped primitive exists.
- **Presentational-only shadcn wrappers** (Input, Card, Table, Alert) are allowed without a Radix primitive; new overlay or roving-focus needs add a Radix-backed shadcn component first.
- **Theme is dark only** — `class="dark"` on `<html>` in `app/`; no light mode or theme toggle in this slice.
- Product UI stays in `app/` (React + Vite); public landing stays **plain static HTML** in `landing/`.
- **Landing: no JavaScript** — all content and SEO metadata in HTML markup; CSS-only styling; crawlers see full page without client execution.
- **Landing: SEO** — semantic HTML (`<main>`, `<h1>`, `<p>`), `<title>`, `<meta name="description">`, `lang="ru"`, optional Open Graph tags; hero layout per `surfaces.md`.
- Logo asset lives at a shared path (e.g. `app/public/logo.svg` referenced from landing via relative path).
- All UI copy remains **Russian**; product name **Caz Agent** on auth and dashboard surfaces per Epic 1.
- Remove Vite scaffold `index.css` and legacy `App.css` after migration.
- All `app/` routes use shadcn components per `components.md` — including dashboard, team, modules, and any future feature pages.
- Initial visual migration stories target Epic 1+2 screens; the stack mandate applies project-wide regardless of epic.
- **Color palette follows stream-helper `main` theme** — near-black surfaces (`#0A0A0C`, `#121215`), amber accent (`#F59E0B`), green success (`#10B981`); token mapping in `design-tokens.md` sourced from [novapointstrix/stream-helper](https://github.com/novapointstrix/stream-helper).

## Non-goals

- Light mode, system theme, or theme toggle.
- Full marketing site (blog, pricing, extra landing routes).
- JavaScript on `landing/` (analytics snippets, hydration, React).
- Figma handoff pipeline (logo may be generated or supplied as SVG during implementation).
- CasinoStream games UI or streamer dashboard.
- Changing auth flows, API contracts, or routing logic.
- Alternative UI libraries (MUI, Chakra, Ant Design).
- Hand-rolled modals, dropdowns, or focus traps without `@radix-ui/*` backing.

## Success signal

A reviewer opens `landing/` (hero, logo, no JS) → clicks CTA into `app/` → logs in on a shadcn dark login page with logo → reaches dashboard: one cohesive product. Lighthouse accessibility on login and dashboard ≥ 90. Landing HTML validates as semantic static document with meta description. `npm run build` in `app/` passes.

## Assumptions

- Logo will be created or supplied as SVG during implementation if no asset exists yet.
- `class-variance-authority`, `clsx`, `tailwind-merge`, and `lucide-react` are acceptable shadcn peer dependencies.
- Landing CTA remains a plain `<a href>` to `../app/` — no JS redirect.

## Open Questions

- Logo source: user-supplied file, or generate a simple SVG mark during implementation?
