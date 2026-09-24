# Bonus Buy — session page (`/modules/bonus-buy/:id`)

Operator workspace for a single bonus buy session. Replaces the placeholder **Session details** card on `BonusBuySessionPage`.

Reference mockup: user-provided screenshot (2026-09-14) — dark layout, amber primary actions, emerald positive currency.

**Stream Widget card:** OBS overlay links and **Widget style** live in a dedicated section below the session header — same pattern as `PrizeSpinStreamWidgetSection` on prize spin (not in the header toolbar).

## Route

| Path | Component | Guards |
|------|-----------|--------|
| `/modules/bonus-buy/:id` | `BonusBuySessionPage` | `ProtectedRoute` → `AppShell` → `AccountActiveRoute` |

Load `bonus_buy` by `:id` for the session account. Invalid id or foreign account → error state (not silent redirect).

## Layout (top → bottom)

Vertical stack inside `AppShell` main, `space-y-6` (or equivalent). All panels use `Card` / dark surface tokens from adopted `design-tokens.md`.

```
PageHeader                ← module title (Gift icon) — same as prize spin session page
SessionHeaderCard         ← title, Archived chip, Edit / Archive only
StreamWidgetCard          ← CAP-26; Monitor icon; overlay links + Widget style
StatsStrip                ← 5 equal stat cards in responsive row
QuickAddSlotCard          ← form panel
BonusListCard             ← list panel with count in title
```

### Responsive

- **Desktop:** stats row = 5 columns; quick-add fields = 3 columns + right-aligned submit.
- **Mobile:** stats wrap 2+2+1 or scroll-x; quick-add fields stack; header actions wrap or collapse to icon-only (implementation choice — preserve all actions reachable).

## 1. Session header card

Compact session card (`StyledSessionCard` pattern shared with prize spin). Background: card surface; subtle border.

### Content

| Element | Behavior | Label (English) |
|---------|----------|-----------------|
| Title | `{record.name} #{record.id}` | e.g. `test #1` |
| Archived chip | When `status = archived` | **Archived** |
| Edit | Active sessions only | **Edit** — opens session edit dialog (name, currency) |
| Archive | Active sessions only | **Archive** — confirm dialog |
| Read-only alert | Archived sessions | **This session is archived. View only.** |

**No** Widget style, OBS link, or Overlay buttons in the header — those live in **Stream Widget** (section 2).

**New session:** create flow remains on history page `/modules/bonus-buy` (**New** in history card) — not duplicated in header in this slice unless product adds it later.

## 2. Stream Widget card

On `/modules/bonus-buy/:id` only — **not** on `/modules/bonus-buy` history page. Placed immediately below the session header card and above the stats strip.

Reuse layout and styling from `PrizeSpinStreamWidgetSection` (`SectionHeader`, outlined action buttons, `cardSx`-equivalent card).

| Control | Label (English) | Behavior |
|---------|-----------------|----------|
| Section title | **Stream Widget** | `Monitor` icon; description mentions OBS overlay for this session |
| Widget style | **Widget style** | In `SectionHeader` `action` slot — opens `BonusBuyWidgetStyleDialog` per [bonus-buy-widget.md](bonus-buy-widget.md) (CAP-19–22) |
| Open overlay | **Open overlay** | New tab → `/modules/bonus-buy/{id}/widget` via `bonusBuyWidgetRoute` |
| OBS link | **OBS link** | Copy `buildBonusBuyObsOverlayUrl(id)` to clipboard; success toast **OBS link copied.** |

Component: `app/src/components/bonus-buy/session/BonusBuyStreamWidgetSection.tsx` (or `bonus-buy-page/` mirror of prize spin folder layout).

URL helpers: `app/src/lib/bonus-buy-overlay-url.ts` — `buildBonusBuyOverlayPath`, `buildBonusBuyObsOverlayUrl` (same contract as `prize-spin-overlay-url.ts`).

Dialog state: parent `BonusBuySessionPage` owns `widgetDialogOpen` and renders `BonusBuyWidgetStyleDialog` once — section receives `onOpenWidgetDialog` callback.

## 3. Stats strip

Five stat cards in one row. Each card: uppercase muted label (xs), large value below.

| # | Label (English) | Value source | Display |
|---|-----------------|--------------|---------|
| 1 | **Start balance** | `record.startBalance` | `$X,XXX.XX`; pencil icon opens dialog with **Start balance ($)**; PATCH on save |
| 2 | **Current balance** | computed — see `bonus-buy-slots.md` | `$X,XXX.XX`; `text-emerald-400` when value ≥ start balance or per product rule |
| 3 | **Spent** | sum of slot purchases | `$X,XXX.XX` |
| 4 | **Profit** | computed — see `bonus-buy-slots.md` | `$X,XXX.XX`; emerald when positive |
| 5 | **Average X** | computed — see `bonus-buy-slots.md` | `Nx` suffix (e.g. `0x`, `12.5x`) |

Empty session (no slots): start balance from record; spent/profit/average = `$0` / `$0` / `0x`; current balance = start balance.

## 4. Quick add slot

Panel title: **Quick add slot**

Form row (3 fields):

| Field | Required | Placeholder (English) |
|-------|----------|----------------------|
| Slot | yes | Slot name |
| Nick / provider | no | Nickname or provider |
| Purchase ($) | yes | Purchase amount |

Submit: primary amber button bottom-right of panel — **+ Add slot**

Validation: inline on submit; disable button while saving. Clear slot + purchase fields on success; keep nick optional field as entered or clear per UX preference.

## 5. Bonus list

Panel title: **Bonus list ({count})** — count = number of slot rows for this session.

### Empty state

Centered muted text: **No bonuses added yet.**

### Populated state

Table or stacked rows per `bonus-buy-slots.md`. List updates immediately after quick-add without full page reload.

**Download XLSX** in the Bonus list card header (visible when count > 0) exports the visible slot rows per `bonus-buy-slots-export.md`.

## States

| State | UI |
|-------|-----|
| Loading | Skeleton for header title, stats cards, form, list |
| Error (bad id, network) | `Alert` destructive; back link to `/bonus-buy` |
| Loaded, zero slots | Stats at defaults; empty list message |

## Visual contract

| Token | Usage on this page |
|-------|-------------------|
| `--card` / `surface` | Header bar, stat cards, form panel, list panel |
| `--primary` (amber) | **+ New session**, **+ Add slot** |
| `--secondary` + border | Widget style, OBS link, Overlay |
| `emerald-400` / `--success` | Current balance, profit when positive |
| `--muted-foreground` | Stat labels, empty state, field labels |

Do not introduce new palette colors beyond adopted `design-tokens.md`.

## Mockup → English label map

| Mockup (RU) | Spec (EN) |
|-------------|-----------|
| + Новая сессия | + New session |
| Стиль виджета | Widget style |
| OBS ссылка | OBS link |
| Оверлей | Overlay |
| СТАРТ БАЛАНС | Start balance |
| ТЕКУЩИЙ БАЛАНС | Current balance |
| ЗАТРАЧЕНО | Spent |
| ПРОФИТ | Profit |
| СРЕДНИЙ X | Average X |
| Быстрое добавление слота | Quick add slot |
| Слот | Slot |
| Ник / Провайдер | Nick / provider |
| Покупка ($) | Purchase ($) |
| + Добавить слот | + Add slot |
| Список бонусов (N) | Bonus list (N) |
| Бонусы пока не добавлены. | No bonuses added yet. |
