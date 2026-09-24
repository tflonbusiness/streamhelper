# Bonus Buy — widget style settings (`bonus_buy_widget`)

Account-level style configuration for all stream overlays at `/modules/bonus-buy/:id/widget`. **One row per account** — shared across every bonus buy session. Defaults match Figma compact frame `bb` (`1:5`, 500×600).

## Database

Table `bonus_buy_widget` in `public` schema. Add via `DatabaseService.initSchema()`.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | `BIGSERIAL PRIMARY KEY` | | |
| `account_id` | `BIGINT NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE` | | One style row per account |
| `width` | `INTEGER NOT NULL` | `500` | Card width px; clamp 200–2400 |
| `height` | `INTEGER NOT NULL` | `600` | Card height px; clamp 200–2400 |
| `background_color` | `TEXT NOT NULL` | `'#0A0A0C'` | Card background |
| `surface_color` | `TEXT NOT NULL` | `'#121215'` | Inner cells, count pill bg |
| `border_color` | `TEXT NOT NULL` | `'#2F2F31'` | Card and pill borders |
| `accent_color` | `TEXT NOT NULL` | `'#F59E0B'` | Icons, LIVE title, module accent |
| `positive_color` | `TEXT NOT NULL` | `'#10B981'` | Win ≥ purchase, average X > 1x |
| `negative_color` | `TEXT NOT NULL` | `'#EF4444'` | Win < purchase |
| `live_color` | `TEXT NOT NULL` | `'#FF2222'` | LIVE badge dot and tint |
| `text_muted_color` | `TEXT NOT NULL` | `'#9CA3AF'` | Nick / provider, purchase labels |
| `border_radius` | `INTEGER NOT NULL` | `20` | Card corner radius px |
| `padding` | `INTEGER NOT NULL` | `18` | Card inner padding px |
| `font_family` | `TEXT NOT NULL` | `'Inter, system-ui, sans-serif'` | Overlay font stack |
| `created_at` | `TIMESTAMPTZ NOT NULL` | `now()` | Server-set on insert |
| `updated_at` | `TIMESTAMPTZ NOT NULL` | `now()` | Server-set on PATCH |

**Color validation:** server accepts `#RRGGBB` or `#RGB` hex only; reject named colors and `rgba()`.

**Dimension validation:** `width` and `height` each ≥ 200 and ≤ 2400.

**Bootstrap:** explicit insert with all default columns from `server/src/bonus-buy/bonus-buy-widget-defaults.ts` (`ON CONFLICT (account_id) DO NOTHING`):

1. **Account provision** — same transaction as `INSERT INTO accounts` in `provisionOwnerFromKick`.
2. **First bonus buy** — same transaction as `POST .../bonus-buys`.
3. **Lazy fallback** — `GET /accounts/:accountId/bonus-buy-widget` or public overlay read if row missing (legacy accounts).

## API — authenticated

Account-scoped REST; `hasActiveMembership(accountId, userId)`.

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/accounts/:accountId/bonus-buy-widget` | — | `BonusBuyWidgetSettings` |
| `PATCH` | `/accounts/:accountId/bonus-buy-widget` | partial fields below | `BonusBuyWidgetSettings` |

**PATCH body** (partial — at least one field):

```ts
{
  width?: number
  height?: number
  background_color?: string
  surface_color?: string
  border_color?: string
  accent_color?: string
  positive_color?: string
  negative_color?: string
  live_color?: string
  text_muted_color?: string
  border_radius?: number
  padding?: number
  font_family?: string
}
```

**Response shape:**

```ts
interface BonusBuyWidgetSettings {
  id: number
  accountId: number
  width: number
  height: number
  backgroundColor: string
  surfaceColor: string
  borderColor: string
  accentColor: string
  positiveColor: string
  negativeColor: string
  liveColor: string
  textMutedColor: string
  borderRadius: number
  padding: number
  fontFamily: string
  createdAt: string
  updatedAt: string
}
```

Client API module: extend `app/src/api/bonus-buy.ts`.

## API — public (overlay)

No auth. Resolves session `bonus_buy` → `account_id` → `bonus_buy_widget`.

| Method | Path | Response |
|--------|------|----------|
| `GET` | `/bonus-buys/:bonusBuyId/widget` | `BonusBuyWidgetView` |

```ts
interface BonusBuyWidgetView {
  record: PublicBonusBuyRecord
  slots: BonusBuySlot[]
  settings: BonusBuyWidgetSettings  // account-level row for record's account
}
```

## Overlay consumption

`BonusBuyStreamWidgetPage` fetches `GET /bonus-buys/:id/widget` and applies account `settings` for all sessions under that account. No URL dimension query params.

## Session workspace UI

**Stream Widget** card on `/modules/bonus-buy/:id` only (CAP-26) — not on history page. **Widget style** in the card header opens the style dialog; **Open overlay** and **OBS link** sit in the card body per [session-page.md](session-page.md).

**Widget style** dialog edits **account** settings via `GET/PATCH /accounts/:accountId/bonus-buy-widget` — changes apply to every session overlay for the team.

### Theme presets (CAP-22)

Built-in presets per [widget-theme-presets.md](widget-theme-presets.md) — eight themes from stream-helper `WIDGET_THEMES`, client constants in `app/src/lib/bonus-buy-widget-presets.ts`.

| Concern | Contract |
|---------|----------|
| Apply | Click preset chip → populate `widgetDraft` with preset colors + shared size/shape defaults |
| Persist | Presets do not write to DB until **Save** |
| Active indicator | Highlight matching preset chip; **Custom** when draft diverges |
| Preview | Live preview updates immediately per CAP-21 |

### Live preview (CAP-21)

Dialog includes a **live preview** of the stream widget that updates on every field change — no Save or API call required.

| Concern | Contract |
|---------|----------|
| Renderer | Shared `WidgetCanvas` extracted from `BonusBuyStreamWidgetPage` (or equivalent shared module) |
| Theme source | In-memory `widgetDraft` when valid; `lastValidWidgetDraft` when current draft fails validation — not saved `bonus_buy_widget` row |
| Data source | Current session `record` and `slots` already loaded on `BonusBuySessionPage` |
| Layout | `md+`: form left, preview panel right inside the same dialog; `<md`: **Preview** opens nested `Dialog` with identical live canvas |
| Scaling | When `widgetDraft.width` / `height` exceed preview container, scale down with `transform: scale()` preserving aspect ratio; label shows actual px (e.g. `600 × 800`) |
| Save | **Save** still PATCHes account settings; preview never writes to DB |
| External link | **Preview overlay** remains — opens `/modules/bonus-buy/:id/widget` in new tab with **saved** settings (post-Save) |

**Invalid draft state** (same rules as Save validation):

1. Keep rendering `WidgetCanvas` with the **last valid** theme snapshot (frozen).
2. Layer a semi-transparent **error placeholder overlay** on the preview panel with the validation message (e.g. bad hex, out-of-range width).
3. Update `lastValidWidgetDraft` only when `validateWidgetDraft(draft)` returns null.

**OBS link** on the Stream Widget card copies the full public overlay URL (see [session-page.md](session-page.md)) — not a stub.
