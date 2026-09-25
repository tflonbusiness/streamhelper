# Деплой на VPS (Docker)

Стек: **Postgres + Nest API + nginx (SPA)** через `docker-compose.prod.yml`.

Каталог на сервере: **`/opt/streamhelper`**.

См. также: [обновление переменных `.env.production`](obnovlenie-env-production.md).

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
| Фронт | Открыть `http://YOUR_VPS_IP/` (или домен) |
| Миграции | `docker compose --env-file .env.production -f docker-compose.prod.yml exec postgres psql -U postgres -d caz_agent -c "SELECT * FROM schema_migrations;"` |
| Kick OAuth redirect | `http://YOUR_VPS_IP/auth/oauth/kick/callback` (с TLS — `https://`) |
| Kick webhook | `http://YOUR_VPS_IP/webhooks/kick` |

Миграции применяются при старте контейнера **server** (`server/migrations/*.sql`).

Ручной прогон миграций (обычно не нужен):

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec server node dist/database/migrate-cli.js
```

## 5. Обновление версии приложения

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

## 6. Алиас в shell (по желанию)

На VPS:

```bash
echo 'alias dcprod="docker compose --env-file /opt/streamhelper/.env.production -f /opt/streamhelper/docker-compose.prod.yml"' >> ~/.bashrc
source ~/.bashrc
```

```bash
cd /opt/streamhelper && dcprod ps
```

## 7. HTTPS и домен

Пока TLS не настроен, nginx отдаёт только **HTTP на порту 80**.

В production у API cookie сессии с флагом **secure** (`NODE_ENV=production`). Вход через Kick по `http://IP` может не работать — нужны:

1. DNS **A**-запись на IP VPS  
2. TLS (например Let's Encrypt); пример — `deploy/nginx/nginx.https.conf.example`  
3. В `.env.production`: `APP_URL`, `CORS_ORIGIN`, `KICK_*` на `https://your-domain.com` ([как применить env](obnovlenie-env-production.md))  
4. `docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build`

В production **не** включайте `KICK_OAUTH_MOCK` и `KICK_CHAT_MOCK`.

## 8. SSH после переустановки VPS

На Mac удалите старый host key:

```bash
ssh-keygen -R YOUR_VPS_IP
ssh root@YOUR_VPS_IP
```

## 9. Бэкап Postgres (рекомендуется)

```bash
cd /opt/streamhelper
docker compose --env-file .env.production -f docker-compose.prod.yml exec postgres \
  pg_dump -U postgres caz_agent > backup-$(date +%F).sql
```

## 10. TablePlus (и другие GUI) через SSH

В `docker-compose.prod.yml` Postgres проброшен только на **localhost VPS**: `127.0.0.1:5433` → контейнер `5432`. В интернет порт не открыт.

После изменения compose на VPS:

```bash
cd /opt/streamhelper
git pull   # или залейте обновлённый yml
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

В TablePlus: **PostgreSQL**, включить **Over SSH** (хост VPS, пользователь SSH), в подключении к БД:

| Поле | Значение |
|------|----------|
| Host | `127.0.0.1` |
| Port | `5433` |
| User / Database | из `.env.production` (`POSTGRES_USER`, `POSTGRES_DB`) |
| Password | `POSTGRES_PASSWORD` |

## Справка: файлы окружения

| Файл | Где | В git |
|------|-----|-------|
| `.env.production.example` | корень репо | да (шаблон) |
| `.env.production` | корень / VPS `/opt/streamhelper/` | нет |
| `server/.env.example` | локальная разработка API | да |
| `server/.env` | `npm run start:dev` | нет |

Prod-контейнеры читают **`.env.production`** через Docker Compose, не `server/.env`.
