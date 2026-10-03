# Деплой на VPS (Docker)

Стек: **Postgres + Nest API + nginx (SPA)** через `docker-compose.prod.yml`.

Каталог на сервере: **`/opt/streamhelper`**.

См. также: [обновление переменных `.env.production`](obnovlenie-env-production.md), [подключение к БД через TablePlus](podklyuchenie-bazy-gui.md).

## Что нужно заранее

- VPS с Docker и Docker Compose v2
- Firewall: порты **22**, **80**, **443**
- Локальный файл **`.env.production`** (не в git; шаблон — `.env.production.example`)
- Приватный репозиторий: `git@github.com:tflonbusiness/streamhelper.git` (HTTPS + PAT или SSH deploy key)

## 1. Первичная настройка VPS

```bash
ssh root@YOUR_VPS_IP

apt-get update
apt-get install -y git docker.io docker-compose-v2 ufw
systemctl enable --now docker

ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable
```

### Клонирование репозитория

```bash
cd /opt
git clone https://github.com/tflonbusiness/streamhelper.git streamhelper
cd /opt/streamhelper
ls docker-compose.prod.yml server app
```

Если HTTPS выдаёт `Repository not found` (приватный репо):

- В поле пароля укажите **Personal Access Token** (не пароль от аккаунта GitHub), или
- Добавьте **deploy key** в настройках репо и клонируйте по SSH:

```bash
git clone git@github.com:tflonbusiness/streamhelper.git streamhelper
```

### Деплой без git на сервере

С Mac (из каталога проекта):

```bash
cd /path/to/streamhelper
git archive master | ssh root@YOUR_VPS_IP 'mkdir -p /opt/streamhelper && tar -x -C /opt/streamhelper'
```

## 2. Копирование `.env.production` с Mac

```bash
scp /path/to/streamhelper/.env.production root@YOUR_VPS_IP:/opt/streamhelper/.env.production
```

Проверка URL на VPS (должны совпадать с Kick Developer и публичным адресом):

```bash
grep -E '^APP_URL|^CORS_ORIGIN|^KICK_REDIRECT|^KICK_WEBHOOK' /opt/streamhelper/.env.production
```

Генерация секретов:

```bash
openssl rand -hex 32
```

Как менять ключи после деплоя — в [obnovlenie-env-production.md](obnovlenie-env-production.md).

## 3. Запуск стека

```bash
cd /opt/streamhelper
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Статус и логи:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs server --tail 50
docker compose --env-file .env.production -f docker-compose.prod.yml logs nginx --tail 20
```

Ожидаемо: `postgres` — healthy, `server` и `nginx` — Up.

## 4. Проверка после запуска

| Проверка | Как |
|----------|-----|
| Лендинг | `https://your-domain/` — статика из `landing/` (собирается в образ nginx) |
| Вход в приложение | `https://your-domain/login` — React SPA |
| Фронт (дашборд) | После Kick OAuth — `/dashboard` |
| Миграции | `docker compose --env-file .env.production -f docker-compose.prod.yml exec postgres psql -U postgres -d caz_agent -c "SELECT * FROM schema_migrations;"` |
| Kick OAuth redirect | `http://YOUR_VPS_IP/auth/oauth/kick/callback` (с TLS — `https://`) |
| Kick webhook | `http://YOUR_VPS_IP/webhooks/kick` |

Миграции применяются при старте контейнера **server** (`server/migrations/*.sql`).

Ручной прогон миграций (обычно не нужен):

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec server node dist/database/migrate-cli.js
```

## 5. Лендинг и маршруты nginx

В production **корень сайта** (`/`) — продающая страница `landing/index.html`. React-приложение и виджеты OBS по-прежнему на тех же путях (`/login`, `/dashboard`, `/modules/.../widget/...`). API проксируется nginx на контейнер `server`.

После изменений в `landing/` или `deploy/nginx/`:

```bash
cd /opt/streamhelper
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build nginx
```

Полный пересбор (`--build` без сервиса) — если менялись `app/` или `server/`.

### SEO (лендинг и legal в Google)

- **`/`** — главная (`landing/index.html`).
- **`/privacy`, `/terms`** — политика и условия (файлы `landing/privacy.html`, `landing/terms.html`, стили `legal.css`).
- **`/login`, `/dashboard`, `/modules/...`, API** — `noindex` (meta в SPA + `X-Robots-Tag` в nginx для SPA и статики лендинга вроде `locale.js`).
- **`/robots.txt`** — `Allow: /$`, `/privacy`, `/terms`; остальное `Disallow: /`.
- Маршруты заданы в `deploy/nginx/snippets/landing-static.conf` (копируется в образ nginx вместе с каталогом `landing/` → `/usr/share/nginx/html/public/`).

После деплоя: пошагово — **[google-indexing.md](google-indexing.md)** (Search Console, sitemap, верификация).

Если домен не `streamhelper.best`, обновите абсолютные URL в `landing/index.html`, `landing/sitemap.xml` и `landing/robots.txt`.

## 6. Обновление версии приложения

С git на VPS:

```bash
cd /opt/streamhelper
git pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

С Mac без `git pull` на сервере:

```bash
cd /path/to/streamhelper
git archive master | ssh root@YOUR_VPS_IP 'tar -x -C /opt/streamhelper'
scp .env.production root@YOUR_VPS_IP:/opt/streamhelper/.env.production
```

На VPS: `docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build`.

## 7. Алиас в shell (по желанию)

На VPS:

```bash
echo 'alias dcprod="docker compose --env-file /opt/streamhelper/.env.production -f /opt/streamhelper/docker-compose.prod.yml"' >> ~/.bashrc
source ~/.bashrc
```

```bash
cd /opt/streamhelper && dcprod ps
```

## 8. HTTPS и домен

Пошагово для **streamhelper.best**: **[instrukciya-https.md](instrukciya-https.md)** (полный чеклист). Справка и renew: [https-streamhelper.md](https-streamhelper.md).

Кратко: DNS → `NGINX_CONFIG=nginx.http-acme.conf` → certbot → `NGINX_CONFIG=nginx.conf` → `APP_URL` / Kick на `https://`.

В production **не** включайте `KICK_OAUTH_MOCK` и `KICK_CHAT_MOCK`.

## 9. SSH после переустановки VPS

На Mac удалите старый host key:

```bash
ssh-keygen -R YOUR_VPS_IP
ssh root@YOUR_VPS_IP
```

## 10. Бэкап Postgres (рекомендуется)

```bash
cd /opt/streamhelper
docker compose --env-file .env.production -f docker-compose.prod.yml exec postgres \
  pg_dump -U postgres caz_agent > backup-$(date +%F).sql
```

## 11. Подключение к БД с Mac (TablePlus)

Пошаговая настройка SSH, порт `127.0.0.1:5433`, типичные ошибки: **[podklyuchenie-bazy-gui.md](podklyuchenie-bazy-gui.md)**.

## Справка: файлы окружения

| Файл | Где | В git |
|------|-----|-------|
| `.env.production.example` | корень репо | да (шаблон) |
| `.env.production` | корень / VPS `/opt/streamhelper/` | нет |
| `server/.env.example` | локальная разработка API | да |
| `server/.env` | `npm run start:dev` | нет |

Prod-контейнеры читают **`.env.production`** через Docker Compose, не `server/.env`.
