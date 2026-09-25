# Пошаговая инструкция: HTTPS и домен streamhelper.best

Полный цикл после того, как DNS указывает на VPS (`dig +short streamhelper.best` → IP сервера) и **http://streamhelper.best** отдаёт сайт.

- Сервер: **`/opt/streamhelper`**
- IP VPS в примерах: **`195.242.119.58`** (замените при необходимости)
- Env: **`.env.production`** (не в git)

См. также: [деплой с нуля](deploy-vps.md), [справка по TLS](https-streamhelper.md), [обновление env](obnovlenie-env-production.md).

---

## Чеклист

- [ ] Код с HTTPS-nginx на VPS (`git pull`)
- [ ] `.env.production` скопирован на VPS
- [ ] Nginx в режиме `nginx.http-acme.conf`
- [ ] Certbot выпустил сертификат
- [ ] `NGINX_CONFIG=nginx.conf`, HTTPS открывается
- [ ] `server` пересоздан с `https://` в env
- [ ] Kick Developer обновлён
- [ ] Вход через Kick в браузере

---

## Шаг 1. Отправить код на VPS

**На Mac** (из каталога проекта):

```bash
git add -A
git commit -m "HTTPS nginx for streamhelper.best"
git push origin master
```

**На VPS:**

```bash
ssh root@195.242.119.58
cd /opt/streamhelper
git pull
```

Должны появиться файлы `deploy/nginx/nginx.http-acme.conf`, `deploy/nginx/nginx.conf`, обновлённый `docker-compose.prod.yml`.

Если `git pull` недоступен — скопируйте архив с Mac:

```bash
git archive master | ssh root@195.242.119.58 'tar -x -C /opt/streamhelper'
```

---

## Шаг 2. Файл `.env.production`

Локально (Mac) в `.env.production` **до certbot**:

```env
NGINX_CONFIG=nginx.http-acme.conf
HTTP_PORT=80
HTTPS_PORT=443

APP_URL=https://streamhelper.best
CORS_ORIGIN=https://streamhelper.best

SESSION_SECRET=...
POSTGRES_USER=postgres
POSTGRES_PASSWORD=...
POSTGRES_DB=caz_agent

KICK_CLIENT_ID=...
KICK_CLIENT_SECRET=...
KICK_REDIRECT_URI=https://streamhelper.best/auth/oauth/kick/callback
KICK_WEBHOOK_PUBLIC_URL=https://streamhelper.best
```

Скопировать на VPS:

```bash
scp /Users/aliaksandr/Desktop/test/.env.production root@195.242.119.58:/opt/streamhelper/.env.production
```

> До выпуска сертификата сайт по **https://** в браузере не откроется — это нормально. Проверяйте **http://streamhelper.best** на шаге 3.

---

## Шаг 3. Certbot и nginx (режим ACME)

**На VPS:**

```bash
apt-get update
apt-get install -y certbot
mkdir -p /var/www/certbot
ufw allow 443

cd /opt/streamhelper
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build nginx
```

Проверка:

```bash
curl -I http://streamhelper.best/
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

У **nginx** в `PORTS`: `0.0.0.0:80->80/tcp` и `0.0.0.0:443->443/tcp`.

---

## Шаг 4. Выпуск сертификата Let's Encrypt

**На VPS** (подставьте email):

```bash
certbot certonly --webroot \
  -w /var/www/certbot \
  -d streamhelper.best \
  -d www.streamhelper.best \
  --email you@example.com \
  --agree-tos \
  --no-eff-email
```

Проверка:

```bash
ls -la /etc/letsencrypt/live/streamhelper.best/
```

Нужны файлы `fullchain.pem` и `privkey.pem`.

---

## Шаг 5. Включить HTTPS в nginx

В **`.env.production`** (Mac) измените одну строку:

```env
NGINX_CONFIG=nginx.conf
```

Остальные `https://` URL оставьте как в шаге 2.

```bash
scp /Users/aliaksandr/Desktop/test/.env.production root@195.242.119.58:/opt/streamhelper/.env.production
```

**На VPS:**

```bash
cd /opt/streamhelper
docker compose --env-file .env.production -f docker-compose.prod.yml up -d nginx
curl -I https://streamhelper.best/
```

Ожидаемо: ответ **200** или редирект с http на https.

Если nginx **не стартует** — сертификат не найден: верните `NGINX_CONFIG=nginx.http-acme.conf`, повторите шаг 4.

---

## Шаг 6. Применить env для API (Kick, сессии)

**На VPS:**

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --force-recreate server
docker compose --env-file .env.production -f docker-compose.prod.yml logs server --tail 30
```

Проверка без вывода секретов:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec server printenv APP_URL
```

Должно быть: `https://streamhelper.best`

---

## Шаг 7. Kick Developer

В настройках приложения Kick укажите:

| Поле | Значение |
|------|----------|
| Redirect URI | `https://streamhelper.best/auth/oauth/kick/callback` |
| Webhook (публичный URL) | `https://streamhelper.best` (путь вебхука: `/webhooks/kick`) |

Должно совпадать с `KICK_REDIRECT_URI` и `KICK_WEBHOOK_PUBLIC_URL` в `.env.production`.

---

## Шаг 8. Финальная проверка

1. Браузер: **https://streamhelper.best** (не http).
2. Вход через Kick.
3. Рестарт API — данные в БД на месте:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml restart server
```

---

## Продление сертификата

Раз в ~90 дней certbot обновляет сертификат. Подробности: [https-streamhelper.md](https-streamhelper.md#5-продление-сертификата).

Кратко на VPS:

```bash
certbot renew --webroot -w /var/www/certbot
docker compose --env-file .env.production -f docker-compose.prod.yml exec nginx nginx -s reload
```

---

## Частые проблемы

| Проблема | Что сделать |
|----------|-------------|
| `ERR_CONNECTION_REFUSED` на https | Сертификат или `NGINX_CONFIG=nginx.conf` не применены; сначала шаги 4–5 |
| Браузер открывает https сам, http не пробовал | Явно **http://** до шага 5 |
| certbot validation failed | DNS, порт 80 с интернета, nginx с `nginx.http-acme.conf` и volume `/var/www/certbot` |
| OAuth / сессия не работает | `APP_URL`, `CORS_ORIGIN`, Kick — только **https://**; пересоздать `server` |
| После `git pull` нет новых nginx-файлов | На Mac не было `git push` |

---

## Обновление env позже

Любая смена ключей или URL: [obnovlenie-env-production.md](obnovlenie-env-production.md).
