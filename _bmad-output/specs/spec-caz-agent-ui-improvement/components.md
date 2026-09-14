# UI components — Caz Agent (shadcn/ui + Radix)

**Project-wide contract.** Every current and future React page in `app/` — auth, dashboard, team, modules, streaming auth, CasinoStream dashboard, and later epics — composes primitives from `app/src/components/ui/`. Feature specs adopt this file; they do not introduce alternate UI libraries.

Pages compose shadcn components; pages do not define one-off button/input styles.

## Radix requirement

Interactive and focus-managed UI **must** use `@radix-ui/*` primitives, typically via shadcn wrappers in `app/src/components/ui/`:

| shadcn component | Radix package | Notes |
|------------------|---------------|-------|
| `Button` (asChild) | `@radix-ui/react-slot` | Slot for composition |
| `Label` | `@radix-ui/react-label` | Accessible label association |
| `Dialog` | `@radix-ui/react-dialog` | Modals, create-admin flows |
| `Switch` | `@radix-ui/react-switch` | Module toggles on `/modules` |
| `Separator` | `@radix-ui/react-separator` | Nav and section dividers in shell |
| (future) `DropdownMenu`, `Tabs`, `Popover`, … | matching `@radix-ui/react-*` | Add via `npx shadcn@latest add` when needed |

Presentational-only wrappers (`Input`, `Card`, `Table`, `Alert`, `Skeleton`) have no Radix primitive — that is normal shadcn. Do **not** hand-roll overlays, focus traps, or roving-focus lists; add the Radix-backed shadcn component first.

## Composition over raw markup

Pages and layout components **maximize** shadcn usage:

- **Page titles** — `PageHeader` / `SectionHeader` (wrap `CardTitle` + `CardDescription`), not raw `<h1>` / `<p>`
- **Nav links** — `Button asChild` + `NavLink`, not styled `<a>` or bare `NavLink`
- **Toggles** — `Switch` + `Label`, not toggle `Button`
- **Loading** — `Skeleton` in `Card`, not plain «Загрузка…» text
- **Dividers** — `Separator`, not `<div className="border-t">`
- **Shell brand** — reuse `BrandHeader`, not duplicate logo markup
- **Muted copy** — `CardDescription` or `Alert` / `AlertDescription`, not one-off `<span className="text-muted-foreground">`

Shared wrappers live in `app/src/components/` (`PageHeader`, `BrandHeader`, `PageShell`, `AppShell`); primitives stay in `app/src/components/ui/`.

## Setup (CAP-7)

```bash
cd app
npx shadcn@latest init
# Style: New York (or Default), base color: Slate, CSS variables: yes
npx shadcn@latest add button input label card alert badge dialog table switch separator skeleton
```

Expected project changes:

- `tailwind.config.ts`, `postcss.config.js`, `components.json`
- `app/src/lib/utils.ts` (`cn()` helper)
- `app/src/index.css` → shadcn `globals.css` with `@tailwind` directives and theme CSS variables
- `tsconfig` path alias `@/*` → `./src/*`
- Remove legacy `App.css` after page migration

## Component map

| UI need | shadcn component | Variants / notes |
|---------|------------------|------------------|
| Page container | `Card` + `CardHeader` + `CardContent` + `CardFooter` | Replaces `.panel` / `.panel-wide` |
| Primary CTA | `Button` | `default` variant |
| Secondary CTA | `Button` | `secondary` variant |
| Destructive / logout | `Button` | `outline` or `ghost` variant |
| Text field | `Input` | Full width via `className="w-full"` |
| Field label | `Label` | Paired with `Input` via `htmlFor` / `id` |
| Error message | `Alert` | `variant="destructive"` |
| Success message | `Alert` | Custom success class or default with green border |
| Role badge | `Badge` | `variant="secondary"` for owner/admin labels |
| Account row | `Card` or styled `div` + `Button` | One card per membership in picker |
| Muted footer link | `Button` | `variant="link"` wrapping `Link` from react-router, or plain `Link` with `text-muted-foreground` |
| Modal / confirm | `Dialog` + `DialogContent` + `DialogHeader` | Radix-backed; e.g. create-admin on `/team` |
| Toggle / enable | `Switch` + `Label` | Radix-backed; module enable on `/modules` |
| Loading placeholder | `Skeleton` | Inside `Card` while data fetches |
| Section divider | `Separator` | Shell nav, future section breaks |
| Page / section title | `PageHeader` / `SectionHeader` | Shared wrappers over `CardTitle` + `CardDescription` |
| Data table | `Table` + `TableHeader` + `TableBody` + `TableRow` | Presentational HTML wrapper; pair actions with `Button` |
| Page layout | Tailwind utilities | `min-h-svh flex items-center justify-center p-6` replaces `.page` |

## PageShell pattern

```tsx
<main className="flex min-h-svh items-center justify-center p-6">
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle>Caz Agent</CardTitle>
      <CardDescription>Войдите с email и паролем</CardDescription>
    </CardHeader>
    <CardContent>...</CardContent>
  </Card>
</main>
```

Wide surfaces (dashboard, picker): `max-w-lg` or `max-w-xl`.

## Form pattern

```tsx
<div className="grid gap-4">
  <div className="grid gap-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" ... />
  </div>
  {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
  <Button type="submit" className="w-full" disabled={submitting}>
    {submitting ? 'Вход...' : 'Войти'}
  </Button>
</div>
```

## Account picker row

```tsx
<Card>
  <CardContent className="flex items-center justify-between gap-4 p-4">
    <div>
      <span className="font-medium">{name}</span>
      <Badge variant="secondary" className="ml-2">{role}</Badge>
    </div>
    <Button size="sm">Войти</Button>
  </CardContent>
</Card>
```

On narrow screens: `flex-col sm:flex-row` for stacking.

## BrandHeader (with logo)

Shared block for login, register, dashboard:

```tsx
<div className="flex flex-col items-center gap-2 mb-2">
  <img src="/logo.svg" alt="Caz Agent" className="h-12 w-12" />
  <CardTitle>Caz Agent</CardTitle>
</div>
```

Dashboard may use smaller logo (`h-8`) inline with title. Asset: `app/public/logo.svg`, same file referenced from `landing/`.

## Icons (optional)

`lucide-react` ships with shadcn — use sparingly (e.g. `Loader2` spin on submit). Not required for MVP polish.

## Landing (no React)

`landing/index.html` cannot import shadcn directly. Mirror CSS variable values from `design-tokens.md` inline; style CTA as a pill button matching shadcn `Button default` dimensions and colors.
