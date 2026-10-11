# Media Interactive — module catalog entry

Delta to adopted `../spec-caz-team-dashboard/modules-catalog.md`. Adds one row to `MODULE_CATALOG` in `app/src/lib/modules.ts`.

## Catalog row

| Field | Value |
|-------|-------|
| **ID** | `media-interactive` |
| **Name** | Media Interactive |
| **Description** | Viewers queue any YouTube video with channel points — backup playback and stream overlay. |
| **Catalog status** | `available` |
| **Widget route** | `/modules/media-interactive` |
| **Toggle** | **none** |

## Icon

| Field | Value |
|-------|-------|
| **Icon** | `YouTube` from `lucide-react` / MUI (implementation choice) |
| **iconVariant** | `danger` |

## Card footer

**Open** → `/modules/media-interactive` (single account workspace — no module sessions). No enable switch on card.

## Placement

Append after existing engagement modules (e.g. after `bonus-buy` when present).
