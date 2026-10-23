# Growing Jackpot — UX convergence (implemented)

Reference module: **First Reaction** (session layout, history list, stream widget settings).

## Session page

- Grid **8 / 4**: round + round history (left), settings sidebar (right).
- `ModulePageSectionChrome` for breadcrumb and header.
- Dedicated loading/error shells.
- Round section: determinate timer progress, `CommandDisplay` keyword pattern.
- Settings: grouped panels + save in section header (`FirstReaction` settings styles).

## Module landing

- Session cards, archived filter, pagination, live hero, entitlement notices.
- `GrowingJackpotCreateDialog` aligned with other modules.

## Stream overlay

- Migration `034_growing_jackpot_widget_style.sql`: `style` JSONB on `growing_jackpot_widget`.
- Settings dialog: size + color fields + live preview (demo accepting state).
- Public widget payloads include `style`; `GrowingJackpotWidgetCard` uses tokens.

## API

- `GET /accounts/:id/growing-jackpots?archived=&page=&limit=` returns `{ sessions, total, page, limit }`.
