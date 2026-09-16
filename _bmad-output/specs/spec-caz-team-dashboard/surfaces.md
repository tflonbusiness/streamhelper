# Surfaces — dashboard, team, and modules routes

Russian copy, shadcn components, hierarchy per adopted UI spec.

## `/dashboard` — two modes

`/dashboard` is the only team-selection surface. There is no `/picker` route.

### Picker mode

**When:** authenticated user has 2+ active memberships and no `accountId` in session (post-login or after «Сменить команду»).

- **Shell:** `nav-shell.md` with «Главная» active; «Команда» and «Модули» disabled until account selected; top bar shows email only (no team meta)
- **H1:** Выберите команду
- **Lead:** У вас доступ к нескольким командам
- **Content:** one `Card` per membership — name, role `Badge`, primary `Button` «Войти»; calls `select-account` then transitions to home mode or redirects to contact-to-pay if inactive
- **Hidden:** team card, stats, modules quick link

### Home mode

**When:** `accountId` set and `accountIsActive=true`.

- **Shell:** `nav-shell.md` with «Главная» active
- **H1:** Главная (page title inside main, not duplicate logo H1 in content)
- **Lead:** Обзор команды и активности

### Sections (top to bottom)

1. **Subscription card** (`Card`)
   - Title: Тариф
   - Badge: plan name (`subscriptionPlan`, e.g. «Бесплатный»)
   - Team name and role **not** repeated here — shown once in shell `SessionContext`

2. **Stats grid** (`mock-stats.md`)
   - Section heading: Статистика
   - Muted hint under heading: «Демо-данные для предпросмотра»
   - Responsive grid: 2 cols mobile, 4 cols desktop

3. **Quick link**
   - Secondary `Button` or `Link`: «Управление модулями →» to `/modules`

**Not on dashboard home:** admin roster, add-admin form, revoke controls — those live on `/team`.

## `/team` — TeamPage

- **Shell:** `nav-shell.md` with «Команда» active
- **H1:** Команда
- **Lead:** Участники с доступом к панели

### Content

1. **Members roster** (`Card`)
   - Table or stacked rows: name, role badge, status badge, action
   - Owner only: form «Имя администратора» + submit «Создать ссылку»
   - Owner and admin: «Отозвать» per active admin row (not owner row)
   - Deactivated admins stay in list with badge «Отозван» and no revoke button
   - Empty state (only owner): «Пока только владелец»
   - On create success: Alert with join link for the new admin

### States

- Loading members: skeleton or «Загрузка…»
- API error on members: `Alert variant="destructive"`
- Add admin success/error: existing Alert pattern
- Revoke success/error: Alert pattern

## `/modules` — ModulesPage

- **Shell:** `nav-shell.md` with **Modules** active
- **H1:** Modules
- **Lead:** Tools for your team's streamers

### Content

- Grid of **exactly two** module cards from `modules-catalog.md` (1 col mobile, 2 cols md+)
- **Bonus Buy:** **Available** badge; primary **Open** button → `/bonus-buy`; no toggle
- **Wheel of Fortune:** **Soon** badge; muted card; **Coming soon** chip in footer; no navigation
- No mock games section; no cards for retired catalog rows

### Card behavior

- Available row with route: shadcn `Button` **Open** (not a toggle `Switch`)
- Coming soon row: no switch or button; badge **Soon** + footer chip **Coming soon**

## Role visibility

| UI element | Owner | Admin |
|------------|-------|-------|
| Team card (dashboard) | yes | yes |
| Mock stats (dashboard) | yes | yes |
| Admin list (`/team`) | yes | yes |
| Add admin form (`/team`) | yes | **no** |
| Revoke admin (`/team`) | yes | yes |
| Module catalog (`/modules`) | yes | yes |
| Switch team (if multi) | yes | yes |
