# HTTPS для streamhelper.best

Let's Encrypt + nginx в Docker. Каталог на VPS: **`/opt/streamhelper`**.

Связанные документы: [деплой](deploy-vps.md), [обновление env](obnovlenie-env-production.md).

## Схема

1. Nginx на **80** отдаёт сайт и `/.well-known/acme-challenge/` (файл `nginx.http-acme.conf`).
2. **Certbot** на хосте выпускает сертификат в `/etc/letsencrypt`.
3. Переключаем nginx на **`nginx.conf`** (редирект 80→443 + TLS).
4. В `.env.production` — только **`https://`** URL, пересоздаём `server`.

---

## 1. Подготовка на VPS

```bash
cd /opt/streamhelper
git pull

apt-get update
apt-get install -y certbot

mkdir -p /var/www/certbot
ufw allow 443
```

В `.env.production` на VPS (и локально) до получения сертификата:

```env
NGINX_CONFIG=nginx.http-acme.conf
HTTP_PORT=80
HTTPS_PORT=443
```

Пока **не** переключайте `APP_URL` на `https://`, пока сертификата нет.

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build nginx
curl -I http://streamhelper.best/
```

---

## 2. Выпуск сертификата

Подставьте свой email:

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
ls /etc/letsencrypt/live/streamhelper.best/
```

Должны быть `fullchain.pem` и `privkey.pem`.

---

## 3. Включить HTTPS в nginx

В `.env.production`:

```env
NGINX_CONFIG=nginx.conf
```

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d nginx
curl -I https://streamhelper.best/
```

Ожидаемо: `HTTP/2 200` (или 301 с http на https).

---

## 4. Env приложения и Kick

В `.env.production`:

```env
APP_URL=https://streamhelper.best
CORS_ORIGIN=https://streamhelper.best
KICK_REDIRECT_URI=https://streamhelper.best/auth/oauth/kick/callback
KICK_WEBHOOK_PUBLIC_URL=https://streamhelper.best
```

С Mac:

```bash
scp .env.production root@YOUR_VPS_IP:/opt/streamhelper/.env.production
```

На VPS:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --force-recreate server
```

В **Kick Developer** — те же `https://` URL.

---

## 5. Продление сертификата

```bash
certbot renew --webroot -w /var/www/certbot
docker compose --env-file .env.production -f docker-compose.prod.yml exec nginx nginx -s reload
```

Cron (пример, `crontab -e`):

```cron
0 3 * * * certbot renew --webroot -w /var/www/certbot --quiet && docker compose -f /opt/streamhelper/docker-compose.prod.yml --env-file /opt/streamhelper/.env.production exec nginx nginx -s reload
```

---

## Ошибки

| Симптом | Решение |
|---------|---------|
| nginx не стартует после `NGINX_CONFIG=nginx.conf` | Сертификата нет — верните `nginx.http-acme.conf`, снова `certbot certonly` |
| certbot failed | DNS на VPS? `curl http://streamhelper.best/.well-known/` — порт 80 доступен с интернета |
| OAuth не работает | `APP_URL` и Kick только `https://`, cookie `secure` в production |
| Другой домен | Поменяйте `server_name` и пути к certs в `deploy/nginx/nginx.conf` |

---

## Переменные compose

| Переменная | Значение |
|------------|----------|
| `NGINX_CONFIG` | `nginx.http-acme.conf` до certbot, потом `nginx.conf` |
| `HTTP_PORT` | `80` |
| `HTTPS_PORT` | `443` |
