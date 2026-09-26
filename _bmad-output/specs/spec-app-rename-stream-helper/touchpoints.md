# Product name and logo touchpoints — Stream Widgets → Stream Helper

Replace every **Stream Widgets** literal in these files with **Stream Helper** unless noted. Replace legacy agent helmet logo with the user-supplied S ribbon mark per `brand.md`.

## `app/`

| File | What to change |
|------|----------------|
| `index.html` | `<title>`; favicon still `logo.svg` |
| `public/logo.svg` | Full graphic per `logo-reference.png`; `aria-label` **Stream Helper** |
| `public/kick-logo-24.png` | Kick mascot per `kick-logo-24.png` in this spec folder |
| `src/pages/LoginPage.tsx` | Hero `/logo.svg` 64×64, `alt` **Stream Helper**, title **Stream Helper** |
| `src/components/KickLoginButton.tsx` | `/kick-logo-24.png` 24×24 on **Sign in with Kick** |
| `src/components/login/loginPageStyles.ts` | Hero logo container sized for 64×64 mark |
| `src/components/BrandHeader.tsx` | Default `title` prop and logo `alt` |
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

Visual check: `/login` — 64×64 S ribbon and Kick mascot on the green button; landing favicon/header match `logo-reference.png`.
