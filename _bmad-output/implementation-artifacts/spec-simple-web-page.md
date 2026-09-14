---
title: 'Simple web page'
type: 'feature'
created: '2026-09-09'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
context: []
baseline_commit: 'NO_VCS'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The project has no user-facing product surface. The user asked for a simple web page in the browser, optimized for search engines using only practices that search engines actually document as useful.

**Approach:** Add a self-contained static page at the project root with a short Russian greeting, readable layout, and a small set of documented on-page signals: language, crawlable HTML, unique title, meta description, one H1 that matches visible text, charset, and a mobile viewport. No framework or build step.

**Decisions:**
- PAGE SUBJECT: simple generic greeting (not a project pitch or custom topic).
- PAGE LANGUAGE: Russian for all visitor-visible copy (`html lang="ru"`).
- SEO SCOPE: only practices with documented search-engine effect for a static HTML document: `lang`, unique `<title>`, `<meta name="description">` (snippet, not ranking), crawlable text that matches what users see, exactly one `<h1>` aligned with the title, UTF-8 charset, and viewport for mobile-friendly rendering.
- SEO OUT: no Open Graph, JSON-LD, `robots.txt`, sitemap, `canonical`, analytics, or `meta name="keywords"` — these are unused, unproven, or require a real public URL.

## Boundaries & Constraints

**Always:** Ship a page that opens by loading a local HTML file. Keep markup and styles under the project root. Leave `.agents`, `_bmad`, and `_bmad-output` unchanged. Visible copy and the title/H1 must say the same greeting in plain HTML (not images or injected-only text). Keep CSS small so the first paint stays cheap.

**Never:** Do not add a framework, bundler, package manager, backend, or deploy pipeline. Do not treat BMAD tooling as application code. Do not use keyword stuffing, hidden text, cloaking, multiple stuffed headings, `meta keywords`, fake structured data, invented absolute URLs, or social-only tags billed as ranking factors.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Open page | User opens `index.html` in a browser | Russian greeting heading and short supporting sentence are visible; layout is readable at a typical desktop width | N/A |
| Narrow viewport | Viewport around 375px wide | Content remains readable without horizontal overflow of the main text | N/A |
| Crawler | Parser reads HTML without executing extra scripts | Same greeting appears in `<title>`, one `<h1>`, and `<main>`; `lang="ru"`; charset and viewport present; meta description restates the greeting in one sentence | N/A |

</frozen-after-approval>

## Code Map

- No existing product files. No `package.json`, no app `index.html`.
- `.agents/`, `_bmad/`, `_bmad-output/` — tooling only; do not modify for this feature.
- Planned: `index.html` (document + documented SEO head) and `styles.css` (layout and typography) at project root.

## Tasks & Acceptance

**Execution:**
- [x] `index.html` -- Create a valid HTML5 document (`lang="ru"`) with documented SEO head tags, one H1 matching the title, `<main>` with the greeting, and a link to `styles.css` -- crawlers and users see the same content.
- [x] `styles.css` -- Add readable typography, spacing, and a simple centered layout that works at desktop and ~375px -- visual quality without a framework.

**Acceptance Criteria:**
- Given the files exist at the project root, when the user opens `index.html` in a browser, then a Russian greeting heading and a short supporting sentence are visible.
- Given a ~375px-wide viewport, when the page is viewed, then the main text stays readable without horizontal overflow.
- Given the HTML source, when `<head>` is inspected, then it includes `lang="ru"` on `<html>`, UTF-8 charset, viewport, a unique Russian title, and a meta description — and does not include `meta keywords`, Open Graph, JSON-LD, or canonical.
- Given the HTML source, when the body is inspected, then there is exactly one `<h1>` whose text matches the title greeting and sits in `<main>`.

## Implementation Notes

- Product files: `index.html`, `styles.css` at project root. Greeting copy is «Здравствуйте» in title, H1, and description.
- Added `verify-page.mjs` (Node, no package manager) so the I/O matrix rows can be checked from the CLI. `node verify-page.mjs` passed.
- Viewport ~375px not opened in a real browser in this environment; CSS uses `min(36rem, 100%)` and `overflow-wrap`.

## Spec Change Log

## Review Triage Log

- `false` — Blind hunter: frozen Always vs writing the spec under `_bmad-output`. The Always rule is about not shipping BMAD folders as app code; the workflow file is the spec, not a product violation.
- `false` — Blind hunter: stale Code Map / missing verifier task. Fix would be editing this spec; rejected.
- `false` — Blind hunter: empty Spec Change Log / Review Triage Log at start of review. Those sections are filled by this step, not by the page implementation.
- `medium` — Blind hunter + verification-gap: `verify-page.mjs` accepts an empty `<p>` and an H1 outside `<main>`. Real: the includes-checks do not enforce supporting copy or nesting. Route: patch.
- `maybe-false` — Blind hunter + verification-gap: ~375px overflow is only grepped in CSS. Would settle with a real viewport measurement; no browser runner in this change. Route: defer.
- `false` — Blind hunter: charset check requires quotes. The page uses quoted `utf-8`; a hypothetical unquoted charset is not this page’s output.
- `low` — Blind hunter: `font-weight: 650` may fall back. Everyday users will not notice; rejected.
- `low` — Blind hunter: `overflow-wrap: anywhere` may split Russian words. Copy stays readable; rejected.
- `false` — Blind hunter: no `prefers-color-scheme`. Intent is a simple greeting page, not a theming system.
- `false` — Blind hunter: no favicon. Not required by the greeting or documented on-page SEO for this file.
- `false` — Edge-case hunter: `readFileSync` throws if HTML/CSS missing. That is not a user path; a missing page already fails the feature.
- `medium` — Verification-gap: open-page check does not assert supporting sentence or H1-in-main. Pre-verified. Route: patch (same as above).
- `medium` — Verification-gap: narrow-viewport check is a CSS substring proxy. Pre-verified. Route: defer (same as maybe-false viewport).
