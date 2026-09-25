# Обновление переменных `.env.production`

Инструкция для уже развёрнутого стека на VPS. Первый деплой — в [deploy-vps.md](deploy-vps.md).

Каталог на сервере: **`/opt/streamhelper`**.  
Рабочий файл: **`/opt/streamhelper/.env.production`** (локальная копия у вас на Mac, в git не коммитится).

## Как это устроено

- Docker Compose передаёт переменные в контейнеры **при создании** контейнера.
- Правка файла на диске **сама** не меняет уже запущенный `server` — нужен `up -d` или `--force-recreate`.
- Prod-контейнеры **не** читают `server/.env` — только `.env.production` в корне проекта на VPS.

## Шаг 1 — правка на Mac

Отредактируйте `.env.production` (образец полей — `.env.production.example`), например:

- `KICK_CLIENT_ID`, `KICK_CLIENT_SECRET`
- `SESSION_SECRET`
- `APP_URL`, `CORS_ORIGIN`, `KICK_REDIRECT_URI`, `KICK_WEBHOOK_PUBLIC_URL`
- `POSTGRES_PASSWORD` (см. раздел про Postgres ниже)

## Шаг 2 — копирование на VPS

```bash
scp /path/to/streamhelper/.env.production root@YOUR_VPS_IP:/opt/streamhelper/.env.production
```

Проверка без вывода секретов (только URL):

```bash
ssh root@YOUR_VPS_IP "grep -E '^APP_URL|^CORS_ORIGIN|^KICK_REDIRECT|^KICK_WEBHOOK' /opt/streamhelper/.env.production"
```

## Шаг 3 — применение на сервере

```bash
ssh root@YOUR_VPS_IP
cd /opt/streamhelper
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

Команда пересоздаёт контейнеры с новым окружением.

Только API, без пересборки образов (смена секретов или URL):

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --force-recreate server
```

Если менялись зависимости или код — полный цикл как при релизе:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

## Шаг 4 — проверка

Не печатайте в чат значения секретов.

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec server printenv APP_URL
docker compose --env-file .env.production -f docker-compose.prod.yml logs server --tail 30
```

Убедитесь, что `APP_URL` совпадает с тем, что ожидаете, и в логах нет ошибок при старте.

## Kick Developer

После смены публичных URL в `.env.production` обновите те же адреса в настройках приложения Kick:

- Redirect URI → `KICK_REDIRECT_URI`
- Webhook URL → `KICK_WEBHOOK_PUBLIC_URL` + путь `/webhooks/kick`

## Пароль Postgres (`POSTGRES_PASSWORD`)

Пароль из `.env.production` используется при **первом** создании volume `postgres_data`.

Изменение строки в файле **не** меняет пароль в уже работающей БД. Варианты:

- сменить пароль вручную в Postgres и синхронизировать `DATABASE_URL` в compose/env;
- или удалить volume и поднять БД заново (**все данные будут потеряны**).

## Локальная разработка и production

| Файл | Назначение |
|------|------------|
| `.env.production` на VPS | Docker prod: `server`, `postgres`, переменные в `docker-compose.prod.yml` |
| `server/.env` на вашем Mac | только `npm run start:dev` |

## Алиас `dcprod`

Если настроен по [deploy-vps.md](deploy-vps.md#6-алиас-в-shell-по-желанию):

```bash
cd /opt/streamhelper
dcprod up -d --force-recreate server
dcprod exec server printenv APP_URL
```
