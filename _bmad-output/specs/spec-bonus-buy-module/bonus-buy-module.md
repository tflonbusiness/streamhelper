# Bonus Buy — module catalog entry

Delta to adopted `../spec-caz-team-dashboard/modules-catalog.md`. Adds one row to `MODULE_CATALOG` in `app/src/lib/modules.ts`. Existing module IDs unchanged.

## Catalog row

| Field | Value |
|-------|-------|
| **ID** | `bonus-buy` |
| **Name** | Bonus Buy |
| **Description** | Slot bonus-buy rounds for stream engagement — viewers trigger bonus features during live play. |
| **Catalog status** | `available` |
| **Widget route** | `/bonus-buy` |
| **Toggle** | **none** — not stored in `caz-modules-{accountId}` |

## Icon

| Field | Value |
|-------|-------|
| **Icon** | `Gift` from `lucide-react` |
| **iconVariant** | `warning` |

## Placement

Append after `kick-integration` in `MODULE_CATALOG` (last card in the grid).

## Card footer

| Footer content |
|----------------|
| **Open** button → `/bonus-buy` only |

No `Switch`, no Connected/Disabled label, no **Soon** badge (status is `available`). Badge in header: **Available** (static).

**Open** uses shadcn `Button` with `Link` to `/bonus-buy`. Implement via optional `widgetRoute` + `hasToggle: false` on `ModuleDefinition`, or a `bonus-buy` branch in `ModulesPage`; avoid a one-off card component.

## Modules page

Card only — **no** inline sub-section (unlike `casino-stream-games` → Games grid). All widget UI lives on `/bonus-buy`.

## Product boundary

Standalone product module. Not part of `casino-stream-games`, not Spin Prediction (`!bonus`). Separate future runtime on the widget page.

## Backend

Per-account `bonus_buy` records — see `bonus-buy-records.md`. Catalog card itself remains client-only (no module toggle persistence).
