# Bonus Buy — widget theme presets

Client-side preset catalog for the **Widget style** dialog. Operators pick a named theme to populate `widgetDraft` in one click; **Save** still PATCHes `bonus_buy_widget` per [bonus-buy-widget.md](bonus-buy-widget.md).

**Source:** [stream-helper](https://github.com/novapointstrix/stream-helper) `WIDGET_THEMES` (`src/constants/themes.ts`). Token names map to `bonus_buy_widget` columns; `rgba()` and gradient tokens from stream-helper are converted to solid `#RRGGBB` hex for DB compatibility.

**Module:** `app/src/lib/bonus-buy-widget-presets.ts` — exports `BONUS_BUY_WIDGET_PRESETS`, `BonusBuyWidgetPresetId`, `getBonusBuyWidgetPreset(id)`, `matchBonusBuyWidgetPreset(draft)`.

## Shared defaults (all presets)

| Field | Value |
|-------|-------|
| `width` | `500` |
| `height` | `600` |
| `borderRadius` | `20` |
| `padding` | `18` |
| `fontFamily` | `'Inter, system-ui, sans-serif'` |

Only color fields vary per preset unless the operator edits size/shape after apply.

## Preset catalog

Each row: `id`, English `name`, three `previewDots` (accent, positive, surface) for the picker chip, and full color columns.

### `main` — Main

Default; values must match `BONUS_BUY_WIDGET_DEFAULTS` / Figma `bb` `1:5`.

| Field | Hex |
|-------|-----|
| `backgroundColor` | `#0A0A0C` |
| `surfaceColor` | `#121215` |
| `borderColor` | `#2F2F31` |
| `accentColor` | `#F59E0B` |
| `positiveColor` | `#10B981` |
| `negativeColor` | `#EF4444` |
| `liveColor` | `#FF2222` |
| `textMutedColor` | `#9CA3AF` |

`previewDots`: `#F59E0B`, `#10B981`, `#121215`

### `classic` — Classic

Dark burgundy streaming overlay.

| Field | Hex |
|-------|-----|
| `backgroundColor` | `#080304` |
| `surfaceColor` | `#110708` |
| `borderColor` | `#542629` |
| `accentColor` | `#FFF000` |
| `positiveColor` | `#24D6A0` |
| `negativeColor` | `#E52E38` |
| `liveColor` | `#E52E38` |
| `textMutedColor` | `#79696B` |

`previewDots`: `#FFF000`, `#542629`, `#24D6A0`

### `ruby` — Ruby

Deep premium red.

| Field | Hex |
|-------|-----|
| `backgroundColor` | `#060204` |
| `surfaceColor` | `#140609` |
| `borderColor` | `#501018` |
| `accentColor` | `#E6193C` |
| `positiveColor` | `#31D6A3` |
| `negativeColor` | `#FF5368` |
| `liveColor` | `#FF5368` |
| `textMutedColor` | `#785A62` |

`previewDots`: `#E6193C`, `#FF4D6D`, `#31D6A3`

### `scarlet` — Scarlet

Bright energetic red.

| Field | Hex |
|-------|-----|
| `backgroundColor` | `#080203` |
| `surfaceColor` | `#180608` |
| `borderColor` | `#641018` |
| `accentColor` | `#FF3045` |
| `positiveColor` | `#2FE0A5` |
| `negativeColor` | `#FF3B4D` |
| `liveColor` | `#FF3B4D` |
| `textMutedColor` | `#826065` |

`previewDots`: `#FF3045`, `#FF6675`, `#2FE0A5`

### `purple` — Purple

Premium casino purple.

| Field | Hex |
|-------|-----|
| `backgroundColor` | `#07030C` |
| `surfaceColor` | `#12091E` |
| `borderColor` | `#3D1564` |
| `accentColor` | `#D946EF` |
| `positiveColor` | `#2BD9A3` |
| `negativeColor` | `#FF5470` |
| `liveColor` | `#FF5470` |
| `textMutedColor` | `#736086` |

`previewDots`: `#D946EF`, `#E879F9`, `#2BD9A3`

### `electric_blue` — Electric Blue

Cold modern blue.

| Field | Hex |
|-------|-----|
| `backgroundColor` | `#02050A` |
| `surfaceColor` | `#081424` |
| `borderColor` | `#1A4570` |
| `accentColor` | `#269BFF` |
| `positiveColor` | `#25D6A2` |
| `negativeColor` | `#FF5570` |
| `liveColor` | `#FF5570` |
| `textMutedColor` | `#59738C` |

`previewDots`: `#269BFF`, `#5BB8FF`, `#25D6A2`

### `midnight` — Midnight

Minimal black.

| Field | Hex |
|-------|-----|
| `backgroundColor` | `#040405` |
| `surfaceColor` | `#121216` |
| `borderColor` | `#2A2A2E` |
| `accentColor` | `#E7E7E9` |
| `positiveColor` | `#31D6A3` |
| `negativeColor` | `#F05252` |
| `liveColor` | `#F05252` |
| `textMutedColor` | `#58585D` |

`previewDots`: `#E7E7E9`, `#FFFFFF`, `#31D6A3`

### `neon` — Neon

Bright futuristic streaming.

| Field | Hex |
|-------|-----|
| `backgroundColor` | `#040207` |
| `surfaceColor` | `#140920` |
| `borderColor` | `#5A1580` |
| `accentColor` | `#FF2BD6` |
| `positiveColor` | `#25F2B1` |
| `negativeColor` | `#FF496E` |
| `liveColor` | `#FF496E` |
| `textMutedColor` | `#7D698A` |

`previewDots`: `#FF2BD6`, `#8B5CFF`, `#25F2B1`

## UI contract

| Concern | Contract |
|---------|----------|
| Placement | Top of Widget style dialog, above **Size** — label **Theme preset** |
| Control | Horizontal scrollable row of `Chip` or `Button` per preset; each shows `name` + three `previewDots` circles |
| Active state | Highlight chip when `matchBonusBuyWidgetPreset(widgetDraft)` returns that `id` |
| Custom state | When draft colors/size differ from every preset, show muted **Custom** label — no chip selected |
| Apply | Click preset → merge preset fields into `widgetDraft` (preserve `id`, `accountId`, timestamps from loaded settings); live preview updates per CAP-21 |
| Save | Unchanged — **Save** PATCHes account row; presets are not stored separately in DB |
| Order | `main`, `classic`, `ruby`, `scarlet`, `purple`, `electric_blue`, `midnight`, `neon` |

## Matching algorithm

`matchBonusBuyWidgetPreset(draft)` compares all style fields (colors, width, height, borderRadius, padding, fontFamily) against each preset's full snapshot. Exact match → preset `id`; else `null` (Custom).

Preset apply is idempotent — re-clicking the active preset resets draft colors to preset values (does not revert manual size edits unless preset includes those fields).
