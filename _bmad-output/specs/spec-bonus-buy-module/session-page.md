# Bonus Buy — session page (`/bonus-buy/:id`)

Operator workspace for a single bonus buy session. Replaces the placeholder **Session details** card on `BonusBuySessionPage`.

Reference mockup: user-provided screenshot (2026-09-14) — dark layout, amber primary actions, emerald positive currency.

## Route

| Path | Component | Guards |
|------|-----------|--------|
| `/bonus-buy/:id` | `BonusBuySessionPage` | `ProtectedRoute` → `AppShell` → `AccountActiveRoute` |

Load `bonus_buy` by `:id` for the session account. Invalid id or foreign account → error state (not silent redirect).

## Layout (top → bottom)

Vertical stack inside `AppShell` main, `space-y-6` (or equivalent). All panels use `Card` / dark surface tokens from adopted `design-tokens.md`.

```
SessionHeaderBar          ← bespoke bar; NOT PageHeader + Gift icon
StatsStrip                ← 5 equal stat cards in responsive row
QuickAddSlotCard          ← form panel
BonusListCard             ← list panel with count in title
```

### Responsive

- **Desktop:** stats row = 5 columns; quick-add fields = 3 columns + right-aligned submit.
- **Mobile:** stats wrap 2+2+1 or scroll-x; quick-add fields stack; header actions wrap or collapse to icon-only (implementation choice — preserve all actions reachable).

## 1. Session header bar

Single horizontal bar spanning full content width. Background: card surface; subtle border; rounded corners matching app cards.

### Left cluster

| Element | Behavior | Label (English) |
|---------|----------|-----------------|
| Back | `Link` or navigate to `/bonus-buy` | Icon only (`ArrowLeft`) |
| Title | `{record.title} #{record.id}` | e.g. `test #1` |
| Edit title | Icon button beside title | Icon only (`Pencil`) — opens inline edit or dialog |

### Right cluster (left → right)

| Element | Variant | Label (English) |
|---------|---------|-----------------|
| New session | Primary (amber) | **+ New session** |
| Widget style | Secondary outline | **Widget style** + palette icon |
| OBS link | Secondary outline | **OBS link** + link/copy icon |
| Overlay | Secondary outline | **Overlay** + external-link icon |
| Exit session | Ghost/icon | Icon only (`LogOut` or `X`) — navigates to `/bonus-buy` |

**New session:** same create flow as `/bonus-buy` (dialog: title + start balance); on success navigate to new `/bonus-buy/:newId`.

**Widget style / OBS link / Overlay:** buttons visible per mockup. Behavior defined in open questions — may stub (toast "Coming soon") until overlay slices land.

## 2. Stats strip

Five stat cards in one row. Each card: uppercase muted label (xs), large value below.

| # | Label (English) | Value source | Display |
|---|-----------------|--------------|---------|
| 1 | **Start balance** | `record.startBalance` | `$X,XXX.XX`; pencil icon for inline edit affordance |
| 2 | **Current balance** | computed — see `bonus-buy-slots.md` | `$X,XXX.XX`; `text-emerald-400` when value ≥ start balance or per product rule |
| 3 | **Spent** | sum of slot purchases | `$X,XXX.XX` |
| 4 | **Profit** | computed — see `bonus-buy-slots.md` | `$X,XXX.XX`; emerald when positive |
| 5 | **Average X** | computed — see `bonus-buy-slots.md` | `Nx` suffix (e.g. `0x`, `12.5x`) |

Empty session (no slots): start balance from record; spent/profit/average = `$0` / `$0` / `0x`; current balance = start balance.

## 3. Quick add slot

Panel title: **Quick add slot**

Form row (3 fields):

| Field | Required | Placeholder (English) |
|-------|----------|----------------------|
| Slot | yes | Slot name |
| Nick / provider | no | Nickname or provider |
| Purchase ($) | yes | Purchase amount |

Submit: primary amber button bottom-right of panel — **+ Add slot**

Validation: inline on submit; disable button while saving. Clear slot + purchase fields on success; keep nick optional field as entered or clear per UX preference.

## 4. Bonus list

Panel title: **Bonus list ({count})** — count = number of slot rows for this session.

### Empty state

Centered muted text: **No bonuses added yet.**

### Populated state

Table or stacked rows per `bonus-buy-slots.md`. List updates immediately after quick-add without full page reload.

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
