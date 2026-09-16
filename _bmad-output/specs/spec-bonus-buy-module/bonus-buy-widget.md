# Bonus Buy — widget style settings (`bonus_buy_widget`)

Per-session style configuration for the stream overlay at `/bonus-buy/:id/widget`. One row per `bonus_buy` session. Defaults match Figma compact frame `bb` (`1:5`, 500×600).

## Database

Table `bonus_buy_widget` in `public` schema. Add via `DatabaseService.initSchema()`.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | `BIGSERIAL PRIMARY KEY` | | |
| `bonus_buy_id` | `BIGINT NOT NULL UNIQUE REFERENCES bonus_buy(id) ON DELETE CASCADE` | | One style row per session |
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

**Bootstrap:** on `POST .../bonus-buys`, insert a `bonus_buy_widget` row with all defaults in the same transaction as the parent `bonus_buy` row.

## API — authenticated (session workspace)

Account-scoped REST; verify `bonus_buy.account_id = :accountId` before read/write.

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/accounts/:accountId/bonus-buys/:bonusBuyId/widget` | — | `BonusBuyWidgetSettings` |
| `PATCH` | `/accounts/:accountId/bonus-buys/:bonusBuyId/widget` | partial fields below | `BonusBuyWidgetSettings` |

**PATCH body** (partial — at least one field):

```ts
{
  width?: number
  height?: number
  backgroundColor?: string
  surfaceColor?: string
  borderColor?: string
  accentColor?: string
  positiveColor?: string
  negativeColor?: string
  liveColor?: string
  textMutedColor?: string
  borderRadius?: number
  padding?: number
  fontFamily?: string
}
```

**Auth:** session user required; `hasActiveMembership(accountId, userId)`.

**Response shape:**

```ts
interface BonusBuyWidgetSettings {
  id: number
  bonusBuyId: number
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

No auth. Used by `BonusBuyStreamWidgetPage` and OBS Browser Source.

| Method | Path | Response |
|--------|------|----------|
| `GET` | `/bonus-buys/:bonusBuyId/widget` | `BonusBuyWidgetView` |

**Response shape:**

```ts
interface BonusBuyWidgetView {
  record: BonusBuyRecord      // account fields omitted or null — public surface
  slots: BonusBuySlot[]       // non-archived only; same shape as authenticated list
  settings: BonusBuyWidgetSettings
}
```

404 when `bonus_buy` id unknown. No account membership check.

**Polling:** overlay may refetch on interval (e.g. 5s) or on focus — WebSocket deferred.

## Overlay consumption

`BonusBuyStreamWidgetPage` fetches `GET /bonus-buys/:id/widget` on load and applies `settings` for card `width`, `height`, colors, `borderRadius`, `padding`, and `fontFamily`. **No URL query params** for dimensions — remove `width`/`height`/`w`/`h` from overlay URL and from `buildBonusBuyWidgetUrl`.

Derived UI colors (e.g. `rgba` borders from hex) computed client-side from stored hex values.

Remove `BONUS_BUY_WIDGET_MOCKS` and `parseBonusBuyWidgetDimensions` URL parsing in this slice.

## Session workspace UI

**Widget style** header button on `/bonus-buy/:id` opens MUI `Dialog` (not **Coming soon** stub).

| Group | Fields | Control |
|-------|--------|---------|
| Size | width, height | `TextField` number inputs |
| Colors | background, surface, border, accent, positive, negative, live, text muted | `TextField` with hex validation or color picker |
| Shape | border radius, padding | `TextField` number inputs |
| Typography | font family | `TextField` |

- Load current values via `GET .../widget` on dialog open.
- **Save** → `PATCH .../widget`; success toast; dialog closes.
- **Preview overlay** link → `/bonus-buy/:id/widget` (no query string).
- Errors via `StatusAlert` in dialog.

**OBS link** remains **Coming soon** stub.

## Mapping to overlay zones

| Overlay zone | Style fields |
|--------------|--------------|
| Widget card | `background_color`, `border_color`, `border_radius`, `padding`, `width`, `height`, `font_family` |
| Summary / list cells | `surface_color` |
| Module icon, LIVE title, crown | `accent_color` |
| Average X > 1x, positive wins | `positive_color` |
| Loss wins, red multiplier pills | `negative_color` |
| LIVE badge | `live_color` |
| Nick, purchase labels | `text_muted_color` |
