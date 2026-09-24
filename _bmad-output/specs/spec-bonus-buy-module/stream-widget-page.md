# Bonus Buy — stream overlay (`/bonus-buy/:id/widget`)

OBS Browser Source surface for a single bonus buy session. Operators preview from the session workspace; OBS loads the same URL.

**Design source:** [Figma bb](https://www.figma.com/design/micj1wbz9kwdzSt7pheawf/bb?node-id=0-1&m=dev) — primary frame **`bb`** (`1:5`, 500×600). Large variant **`BONUS BUY #2`** (`8:23`, 1100×1100) is a future widget-style breakpoint — not this slice.

## Route

| Path | Component | Guards |
|------|-----------|--------|
| `/bonus-buy/:id/widget` | `BonusBuyStreamWidgetPage` | **Public** — no `ProtectedRoute`, no login redirect |

Register in `App.tsx` as a top-level route **outside** `ProtectedRoute` and `AppShell`. OBS Browser Source must load the URL without a dashboard session cookie. No sidebar, `PageHeader`, or breadcrumbs.

**URL:** `/bonus-buy/:id/widget` only — no `width`, `height`, `w`, or `h` query params. Card size comes from `bonus_buy_widget.width` / `height` via public API.

`:id` loads live data from `GET /bonus-buys/:id/widget` (session slots + **account** widget settings). Unknown id → centered **Session not found.** on transparent canvas.

## Data

On mount, fetch `GET /bonus-buys/:bonusBuyId/widget` (see [bonus-buy-widget.md](bonus-buy-widget.md)). Use `record`, `slots`, and `settings` from response. Optional refetch interval for OBS live updates.

Loading: minimal centered spinner or skeleton on transparent canvas. Error / 404: **Session not found.**

## Canvas

| Property | Source |
|----------|--------|
| Viewport | Transparent `min-h-svh`; OBS chroma-key friendly |
| Card width | `settings.width` px |
| Card height | `settings.height` px |
| Card bg | `settings.backgroundColor` |
| Card border | `1px solid settings.borderColor` |
| Card radius | `settings.borderRadius` px |
| Card padding | `settings.padding` px |
| Gap between zones | `10px` (fixed) |
| Font | `settings.fontFamily` |

## Layout (top → bottom)

```
WidgetCard (settings.width × settings.height, flex col)
  HeaderBar           ← icon + title + purchased count pill
  SummaryRow          ← start balance + average X (2 cells)
  WinHighlightRow     ← crown + playing slot win (when win set)
  LivePlayingRow      ← accent_color + LIVE badge (when is_now_playing)
  SlotList            ← scrollable completed slots
```

### 1. Header bar

Height ~55px; bottom border `#1F1F24` 2px.

| Element | Source | English label |
|---------|--------|---------------|
| Module icon | Gift / module glyph, 42×42 | — |
| Title | `Bonus Buy #{record.id}` | Title case per Figma (`Bonus Buy #54`) |
| Count pill | non-archived slot count | Gift icon 30px + `{count}` — no separate “Purchased” text in compact frame |

Right pill: bg `settings.surfaceColor`, border `settings.borderColor`, radius `12px`, padding `6px 12px`.

### 2. Summary row

Two equal-height cells (54px), gap `12px`, radius `12px`, bg `settings.surfaceColor`, border `rgba(255,255,255,0.12)`.

| Cell | Icon | Value | Color |
|------|------|-------|-------|
| Left | Basket (`Basket_alt_3`, 36px) | `record.startBalance` formatted `$X,XXX` | white |
| Right | Happy face (36px) | `stats.averageX` e.g. `1.48x` | `settings.positiveColor` when value > `1x`, else white |

Compute via `computeSessionStats` in `bonus-buy-stats.ts` (non-archived slots only).

### 3. Win highlight row

Shown when the **now playing** slot has `winAmount` set. Height 68px; same cell styling as summary.

| Element | Display |
|---------|---------|
| Crown icon | 36×36, `settings.accentColor` |
| Slot name | `name`, semibold 22px white |
| Provider | `providerName` when non-empty after trim, 18px `settings.textMutedColor` — **omit line** when null/empty (no `—` placeholder); when omitted, **vertically center** slot name in the title block |
| Win amount | Right-aligned, semibold 26px white |

Row height stays **68px** whether provider is shown or omitted.

Hidden when no playing slot or playing slot has no win yet.

### 4. Live playing row

Shown when a slot has `isNowPlaying: true`. Height 68px.

| Element | Display |
|---------|---------|
| Left accent | 8px bar `settings.accentColor` with glow |
| Title | `{index}. {name}` truncated, 22px `settings.accentColor` |
| Provider | `providerName` when non-empty after trim, 18px `settings.textMutedColor` — **omit line** when null/empty (no `—`); when omitted, **vertically center** the title line in the info block |
| Purchase | formatted `purchaseAmount`, muted, right area |
| LIVE badge | Dot `settings.liveColor` + **LIVE** uppercase, pill tinted from `liveColor` |

Row height stays **68px** whether provider is shown or omitted.

When no playing slot: omit row (do not render empty placeholder).

### 5. Slot list

Scrollable area (`overflow-y: auto`, mask fade at bottom per Figma). Each **item** 62px, gap `10px`, radius `12px`, bg `settings.surfaceColor`, border `rgba(255,255,255,0.12)`.

Excludes the `isNowPlaying` slot (shown in rows 3–4). Order: creation order ascending; display index `1.` `2.` …

| Column | Source | Style |
|--------|--------|-------|
| Title block | `{n}. {name}` + optional `providerName` | Title 22px white; provider 16px `textMutedColor` when non-empty after trim — **omit provider line** when null/empty (no `—`); when omitted, **vertically center** the title in the block |
| Purchase | `purchaseAmount` | 18px `textMutedColor` |
| Win | `winAmount` or pending | `positiveColor` if win ≥ purchase, `negativeColor` if win < purchase; em dash if null |
| Multiplier pill | `multiplier` | Pill tinted red or green matching win |

Each list row height stays **74px** (`cellHeight`) whether provider is shown or omitted.

Empty session (zero non-archived slots): summary row shows start balance + `0x`; no list items.

## Session workspace link

`/bonus-buy/:id` **Overlay** button → `/bonus-buy/:id/widget` (same tab). **Widget style** opens style dialog per `bonus-buy-widget.md`. **OBS link** remains **Coming soon** stub.

## Figma → English label map

| Figma (RU) | Spec (EN) |
|------------|-----------|
| Затрачено | Spent (large variant only — deferred) |
| Выигрыш | Winnings (large variant only — deferred) |
| Средний X | Average X |
| КУПЛЕНО | Purchased (large variant header only) |
| ОТКРЫВАЕМ | Opening (large variant live row — deferred) |
| LIVE | LIVE |

Compact frame uses icon+count instead of “Purchased” text.

## States

| State | UI |
|-------|-----|
| Loading | Spinner/skeleton on transparent canvas |
| Known session id | Full widget card from live API |
| Unknown id | **Session not found.** centered |
| Playing, no win | Summary + LIVE row only |
| Playing with win | Summary + win highlight + LIVE row + list |
| No playing slot | Summary + list only |

## Out of scope (this companion)

- Large `8:23` layout variant
- WebSocket, SSE, signed OBS token
- Copy OBS URL (**OBS link** stub on session page)
- Chat-bot integration
- URL query param overrides for width/height
