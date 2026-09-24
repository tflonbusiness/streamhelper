# Product name touchpoints — Caz Agent → Stream Widgets

Implementation checklist. Replace every **Caz Agent** literal in these files with **Stream Widgets** unless noted.

## `app/`

| File | What to change |
|------|----------------|
| `index.html` | `<title>` |
| `public/logo.svg` | `aria-label` on root `<svg>` |
| `src/components/BrandHeader.tsx` | Default `title` prop and logo `alt` |
| `src/pages/LoginPage.tsx` | Logo `alt` and visible brand title |
| `src/components/AppShell.tsx` | `SidebarLogo` `alt` (mobile and desktop) |

## `landing/`

| File | What to change |
|------|----------------|
| `index.html` | `<title>`, `og:title`, `.brand-name`, hero lead sentence opening, footer copyright |

Suggested patterns (keep existing taglines; swap only the name):

- Title / og: `Stream Widgets — Kick stream engagement tools`
- Hero lead: `Stream Widgets gives casino streamers…`
- Footer: `© {year} Stream Widgets`

## Policy doc (same slice)

| File | What to change |
|------|----------------|
| `_bmad-output/specs/spec-app-english-only/conventions.md` | Opening sentence product name |

## Explicitly out of scope (do not change in this slice)

- `docker-compose.yml`, `docker-compose.prod.yml`, `server/.env.example`, `DATABASE_URL` / `caz_agent` database name
- `AppShell` `NAV_EXPANDED_STORAGE_KEY` (`caz-shell-nav-visible`)
- `_bmad-output/**` historical specs and epics (audit only)
- Mock contact handles (`@caz_agent_mock`, `*@caz-agent.example`) — confirmed out of scope

## Verification

```bash
rg 'Caz Agent' app/ landing/ app/public/logo.svg
```

Expect **no matches** after implementation.
