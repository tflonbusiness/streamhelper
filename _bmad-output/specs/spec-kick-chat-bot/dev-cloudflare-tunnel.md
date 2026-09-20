# Local dev — Cloudflare Tunnel for Kick webhooks

Kick webhooks require a **public HTTPS URL**. Use Cloudflare Tunnel to expose services without ngrok.

You usually need **two tunnels** (or one tunnel to the API only for webhooks):

| Purpose | Local port | Tunnel command |
|---------|------------|----------------|
| Kick webhooks | `3000` (NestJS API) | `cloudflared tunnel --url http://localhost:3000` |
| App / OAuth in browser | `5173` (Vite) | `cloudflared tunnel --url http://localhost:5173` |

`app/vite.config.ts` allows `*.trycloudflare.com` hosts so Vite does not block tunnel requests.

## Prerequisites

- [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) installed
- Kick Developer app with **Webhooks enabled**
- `server/.env` with `KICK_CLIENT_ID`, `KICK_CLIENT_SECRET` (real mode)

## Webhook tunnel (API — port 3000)

1. Start the API server:

```bash
cd server
npm run start:dev
```

2. Start a quick tunnel to the **API**:

```bash
cloudflared tunnel --url http://localhost:3000
```

Copy the `https://*.trycloudflare.com` URL from the output.

3. In [Kick Developer Settings](https://kick.com/settings/developer), set **Webhook URL** to:

```
https://YOUR-TUNNEL.trycloudflare.com/webhooks/kick
```

**Do not** point the webhook URL at port `5173` — that is the Vite dev server, not the webhook receiver.

## App tunnel (optional — port 5173)

For testing the React app or OAuth redirect through a public URL:

```bash
cd app && npm run dev
cloudflared tunnel --url http://localhost:5173
```

Set `APP_URL` and `KICK_REDIRECT_URI` in `server/.env` to match the Vite tunnel URL if Kick OAuth should callback through it.

4. For real webhook testing, disable mock mode in `server/.env`:

```
KICK_OAUTH_MOCK=false
KICK_CHAT_MOCK=false
```

5. Log in via Kick OAuth so the app subscribes to `chat.message.sent` for your channel.

## Mock mode (no tunnel)

When you only need intake logic without Kick delivery:

```
KICK_CHAT_MOCK=true
```

Inject a chat message:

```bash
curl -s -X POST http://localhost:3000/dev/kick/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "message_id": "mock-001",
    "broadcaster": { "user_id": "channel-mock" },
    "sender": { "user_id": "999", "username": "viewer_one", "identity": { "badges": [{ "type": "subscriber" }] } },
    "content": "!roll"
  }'
```

Use the `channel_id` stored in `account_channels` for your test account (mock login uses `channel-mock`).
