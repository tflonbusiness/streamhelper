# Подключение к Postgres на VPS (TablePlus и другие GUI)

База в production работает **только внутри Docker-сети**. С интернета к `5432` подключиться нельзя — так и задумано.

Для DBeaver, DataGrip, TablePlus используется:

1. проброс Postgres на **localhost VPS** (`127.0.0.1:5433`);
2. **SSH-туннель** с вашего Mac на VPS.

Каталог проекта на сервере: **`/opt/streamhelper`**.

См. также: [деплой](deploy-vps.md), [обновление `.env.production`](obnovlenie-env-production.md).

---

## 1. Требования на VPS

В `docker-compose.prod.yml` у сервиса `postgres` должен быть блок:

```yaml
    ports:
      - '127.0.0.1:5433:5432'
```

Порт слушает **только loopback** на VPS, не `0.0.0.0` — снаружи мира Postgres недоступен.

После `git pull` (или копирования файла) пересоздайте контейнер:

```bash
cd /opt/streamhelper
grep "127.0.0.1:5433" docker-compose.prod.yml
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --force-recreate postgres
```

Проверка:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
ss -lntp | grep 5433
```

В колонке `PORTS` у postgres: `127.0.0.1:5433->5432/tcp`.

Учётные данные — из `/opt/streamhelper/.env.production`:

| Переменная | Обычно |
|------------|--------|
| `POSTGRES_USER` | `postgres` |
| `POSTGRES_PASSWORD` | ваш секрет |
| `POSTGRES_DB` | `caz_agent` |

---

## 2. TablePlus — настройки

Создайте подключение **PostgreSQL**. Важно **не перепутать** поля SSH и поля базы.

### Вкладка подключения к БД (верх)

| Поле | Значение |
|------|----------|
| Host | `127.0.0.1` |
| Port | **`5433`** (не 5432) |
| User | `POSTGRES_USER` (обычно `postgres`) |
| Password | `POSTGRES_PASSWORD` |
| Database | `POSTGRES_DB` (обычно `caz_agent`) |
| SSL mode | **`DISABLE`** |

### Over SSH (включить)

| Поле | Значение |
|------|----------|
| Server | **IP или домен VPS** (не `127.0.0.1`) |
| Port | **`22`** |
| User | пользователь SSH (`root` или ваш) |
| Password / SSH key | доступ **к серверу**, не к Postgres |

Пользователь `postgres` и пароль БД — **только в верхней секции**.

Схема:

```text
Mac (TablePlus) → SSH :22 → VPS → 127.0.0.1:5433 → контейнер postgres:5432
```

**Test** → **Connect**.

---

## 3. Проверка без TablePlus

### Только SSH + psql внутри контейнера

```bash
ssh root@YOUR_VPS_IP
cd /opt/streamhelper
docker compose --env-file .env.production -f docker-compose.prod.yml exec postgres \
  psql -U postgres -d caz_agent
```

В `psql`: `\dt` — таблицы, `\q` — выход.

### Ручной туннель с Mac (как делает TablePlus)

Терминал 1:

```bash
ssh -N -L 5433:127.0.0.1:5433 root@YOUR_VPS_IP
```

Терминал 2 (пароль — `POSTGRES_PASSWORD`):

```bash
psql -h 127.0.0.1 -p 5433 -U postgres -d caz_agent
```

В TablePlus можно временно отключить Over SSH и подключаться к `127.0.0.1:5433`, пока туннель открыт.

---

## 4. Другие клиенты

Те же параметры:

- **SSH:** хост VPS, порт 22, пользователь SSH;
- **БД (через туннель):** `127.0.0.1:5433`, user/database/password из `.env.production`, SSL выключен.

Строка подключения **через туннель** (после поднятия SSH):

`postgresql://postgres:PASSWORD@127.0.0.1:5433/caz_agent`

Внутри Docker (только с контейнера `server`):

`postgresql://postgres:PASSWORD@postgres:5432/caz_agent`

---

## 5. Типичные ошибки

| Симптом | Причина | Что сделать |
|---------|---------|-------------|
| `Failed to create tunnel` | SSH не работает | `ssh root@VPS` с Mac; ключ/пароль в Over SSH |
| SSH Server = `127.0.0.1`, порт 5433 | Перепутаны SSH и БД | SSH → IP VPS и порт **22** |
| `server closed the connection unexpectedly` | Нет `127.0.0.1:5433` на VPS | `git pull`, `--force-recreate postgres`, проверить `ss` |
| В `docker ps` только `5432/tcp` | Старый compose без `ports` | Обновить yml, пересоздать контейнер; убедиться что `git push` с Mac был до `pull` |
| Неверный пароль | Путаница секретов | В GUI — `POSTGRES_PASSWORD`, не `SESSION_SECRET` и не SSH-пароль |
| SSL errors | Клиент требует SSL | SSL mode **DISABLE** |
| `REMOTE HOST IDENTIFICATION HAS CHANGED` | Переустановка VPS | На Mac: `ssh-keygen -R YOUR_VPS_IP` |

---

## 6. Безопасность

- Не публикуйте Postgres на `0.0.0.0:5432` и не открывайте 5432 в `ufw`.
- Проброс `127.0.0.1:5433` доступен только после входа по SSH на VPS.
- Не коммитьте `.env.production` в git.

---

## 7. Локальная разработка

Локальный Postgres из `docker-compose.yml` (порт **5433** на Mac) — отдельный инстанс, не VPS.

Для dev API используется `server/.env` и `DATABASE_URL=...@localhost:5433/...`. Это **не** то же подключение, что к production на VPS.
