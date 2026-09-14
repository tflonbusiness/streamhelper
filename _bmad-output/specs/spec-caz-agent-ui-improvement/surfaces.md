# Surfaces — per-route UI requirements

All app routes: Russian copy, shadcn `Card` layout, logo + hierarchy per surface.

## `/` — LoginPage

- **Logo:** Caz Agent mark above title
- **H1:** Caz Agent (or logo replaces text — logo + optional subtitle)
- **Lead:** Войдите с email и паролем
- **Primary:** Войти (submit)
- **Secondary:** Link to `/register`
- **States:** submitting disables button; API error in Alert

## `/register` — RegisterPage

- **Logo:** same as login
- **H1:** Caz Agent
- **Lead:** Создайте аккаунт пользователя
- **Primary:** Зарегистрироваться
- **Secondary:** Link to `/`

## `/onboarding` — OnboardingPage (3 modes)

### choose

- **H1:** Добро пожаловать
- **Lead:** Вы ещё не состоите ни в одной команде
- **Primary:** Создать свою команду
- **Secondary:** Ждать добавления

### create

- **H1:** Создать команду
- **Lead:** Укажите название вашей команды в Caz Agent
- **Primary:** Создать команду
- **Secondary:** Назад

### wait

- **H1:** Ожидание доступа
- **Lead:** Попросите владельца команды добавить ваш email
- **Primary:** Назад

## `/picker` — AccountPickerPage

- **H1:** Выберите команду
- **Lead:** У вас доступ к нескольким командам
- **Content:** Card per membership with Badge + Button

## `/dashboard` — DashboardPage

- **Logo:** small mark in header row
- **H1:** Caz Agent
- **Lead:** Панель управления для активной команды
- **Meta line:** email · account name · role
- **Actions:** Switch team, add-admin (owner), logout (ghost/outline)

## `/contact` — ContactPage

- **H1:** Оплата доступа
- **Lead:** Свяжитесь с нами, чтобы активировать доступ
- **Content:** Telegram + email as styled rows
- **Primary:** Выйти (secondary)

## `landing/index.html` — Hero (static, SEO, no JS)

Single-page hero. **No `<script>` tags.** All content in HTML.

### Structure

```html
<html lang="ru">
<head>
  <title>Caz Agent — сервис для операторов</title>
  <meta name="description" content="..." />
  <!-- optional: og:title, og:description, og:image -->
</head>
<body>
  <main>
    <img src="..." alt="Caz Agent" />   <!-- logo -->
    <h1>Caz Agent</h1>
    <p>Описание продукта (1–2 предложения, русский)</p>
    <a href="../app/" class="cta">Войти в приложение</a>
  </main>
</body>
</html>
```

### Visual

- Dark background matching app `--background`
- Centered column, max-width ~42rem
- Logo ~48–64px height
- CTA styled as primary button (CSS only, no JS)
- Inter font via `<link>` to Google Fonts (CSS resource, not JS)

### SEO checklist

- `lang="ru"` on `<html>`
- Unique `<title>` and `<meta name="description">`
- One `<h1>` per page
- Meaningful `<img alt="Caz Agent">`
- CTA is crawlable `<a href>` with descriptive text
- No content hidden behind JavaScript

## Global loading route

- Centered «Загрузка…» with same PageShell; shadcn-consistent spinner optional
