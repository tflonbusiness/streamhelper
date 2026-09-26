# Product name and logo touchpoints — Stream Widgets → Stream Helper

Replace every **Stream Widgets** literal in these files with **Stream Helper** unless noted. Replace legacy agent helmet logo with the user-supplied S ribbon mark per `brand.md`.

## `app/`

| File | What to change |
|------|----------------|
| `index.html` | `<title>`; favicon still `logo.svg` |
| `public/logo.svg` | Full graphic per `logo-reference.png`; `aria-label` **Stream Helper** |
| `src/components/BrandHeader.tsx` | Default `title` prop and logo `alt` |
| `src/pages/LoginPage.tsx` | Logo `alt` and visible brand title |
| `src/components/AppShell.tsx` | `SidebarLogo` `alt` (mobile and desktop) |

## `landing/`

| File | What to change |
|------|----------------|
| `index.html` | `<title>`, `og:title`, `.brand-name`, hero lead sentence opening, footer copyright |
| `logo.svg` | Same graphic as app; `aria-label` **Stream Helper** |

Suggested patterns (keep tagline; swap only the name):

- Title / og: `Stream Helper — Kick stream engagement tools`
- Hero lead: `Stream Helper gives casino streamers…`
- Footer: `© {year} Stream Helper`

## Policy doc (same slice)

| File | What to change |
|------|----------------|
| `_bmad-output/specs/spec-app-english-only/conventions.md` | Opening sentence product name |

## Explicitly out of scope

- VPS path `/opt/streamhelper`, repo `streamhelper`, env `APP_URL` — already aligned with domain
- Postgres `caz_agent`, Docker env, `localStorage` keys
- `_bmad-output/**` historical specs (audit only)
- Mock `caz-agent` contact handles

## Verification

```bash
rg 'Stream Widgets' app/ landing/
```

Expect **no matches** after implementation.

Visual check: open login and landing; favicon and header logos match `logo-reference.png` in this spec folder.
