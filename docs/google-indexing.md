# Индексация в Google (Search Console)

Сайт **streamhelper.best** уже настроен для поиска:

| URL | Назначение |
|-----|------------|
| `/` | Главная (`landing/index.html`) — `index, follow`, canonical, Open Graph, JSON-LD |
| `/privacy`, `/terms` | Legal-страницы |
| `/robots.txt` | Индексируются только `/`, `/privacy`, `/terms` |
| `/sitemap.xml` | Карта сайта для Google |

Приложение (`/login`, `/dashboard`, API) закрыто от индекса (`noindex`).

## 1. Подтвердить владение доменом

1. Откройте [Google Search Console](https://search.google.com/search-console).
2. **Добавить ресурс** → тип **Домен** (`streamhelper.best`) или **URL-префикс** (`https://streamhelper.best/`).

### Вариант A — DNS (рекомендуется для типа «Домен»)

В панели регистратора домена добавьте **TXT-запись**, которую покажет Google. Подождите 5–30 минут и нажмите **Проверить**.

### Вариант B — HTML-файл

1. В GSC выберите метод **HTML-файл**, скачайте файл вида `googleXXXXXXXX.html`.
2. Положите его в каталог **`landing/`** в репозитории (рядом с `index.html`).
3. Задеплойте nginx (см. [deploy-vps.md](deploy-vps.md)).
4. Проверьте: `curl -I https://streamhelper.best/googleXXXXXXXX.html` → **200**.
5. Нажмите **Проверить** в GSC.

Nginx уже отдаёт такие файлы (`landing-static.conf`).

### Вариант C — мета-тег

1. Скопируйте тег из GSC (`content="…"`).
2. В `landing/index.html` замените комментарий на строку:

   ```html
   <meta name="google-site-verification" content="ВАШ_ТОКЕН" />
   ```

3. Задеплойте и проверьте в GSC.

## 2. Отправить sitemap

В Search Console: **Файлы Sitemap** → добавить:

```text
https://streamhelper.best/sitemap.xml
```

Статус должен стать «Успешно»; через несколько дней появятся страницы в отчёте **Проверка URL** / **Страницы**.

## 3. Запросить индексацию главной (по желанию)

**Проверка URL** → `https://streamhelper.best/` → **Запросить индексирование**.

То же для `/privacy` и `/terms`, если нужно быстрее.

## 4. После изменений лендинга

Обновите `lastmod` в `landing/sitemap.xml` для изменённых URL и снова отправьте sitemap (или дождитесь автоматического обхода).

Пересбор только nginx:

```bash
cd /opt/streamhelper
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build nginx
```

## Другой домен

Замените `https://streamhelper.best` в:

- `landing/index.html` (canonical, og, JSON-LD)
- `landing/sitemap.xml`
- `landing/robots.txt`
- `landing/privacy.html`, `landing/terms.html` (canonical)
