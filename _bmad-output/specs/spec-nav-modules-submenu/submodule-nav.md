# Sidebar — Modules sub-navigation

Extends adopted `../spec-caz-team-dashboard/nav-shell.md` and `../spec-subscription-tab/nav-delta.md` for top-level order. This slice adds **nested quick links** under **Modules** on the **desktop sidebar** when expanded.

## Data source

Filter `MODULE_CATALOG` in `app/src/lib/modules.ts` to **`status === 'available'`** and a defined `widgetRoute`. Use `getAvailableNavModules()` — do not duplicate names or routes in `AppShell`.

| Catalog `id` | Sub-label | `widgetRoute` | In sub-nav |
|--------------|-----------|---------------|------------|
| `bonus-buy` | Bonus Buy | `/modules/bonus-buy` | yes |
| `prize-spin` | Prize Spin | `/modules/prize-spin` | yes |
| `chat-roll` | Chat Roll | `/modules/chat-roll` | **no** (`coming_soon` — catalog page only) |

## Desktop sidebar (expanded)

Under the **Modules** top-level row (`/modules`):

1. **Parent** — label **Modules**, `ExtensionIcon`, navigates to `/modules`, `end: false` (active on any `/modules/*` path).
2. **Children** — one text link per available module, indented (`pl` ~3.5), `body2`, secondary text color.
3. **Do not** render `coming_soon` modules in the sub-nav.

Collapsed sidebar: hide children; parent icon → `/modules`.

## Mobile

One **Modules** entry → `/modules` only (`end: false` so deep module routes keep the tab active).

## Active states

| Path | Highlight |
|------|-----------|
| `/modules` (exact) | Parent **Modules** |
| `/modules/bonus-buy` or deeper | Parent + **Bonus Buy** child |
| `/modules/prize-spin` or deeper | Parent + **Prize Spin** child |

## Touchpoints

| File | Change |
|------|--------|
| `app/src/lib/modules.ts` | `getAvailableNavModules()` |
| `app/src/components/AppShell.tsx` | `SidebarModulesNav` + submodule links |

## Verification

Sidebar expanded + account: **Modules**, **Bonus Buy**, **Prize Spin** — no **Chat Roll**. Sub-links navigate correctly. `/modules` still shows all catalog cards.
