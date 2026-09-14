# Kick OAuth setup

Load-bearing companion for CAP-1 and Story 4.2. Kick uses OAuth 2.1 on `id.kick.com`; resource API on `api.kick.com/public/v1`.

## Environment variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `KICK_OAUTH_MOCK` | no | `true` | `true` = local mock (no Kick app). Set `false` for real OAuth. |
| `KICK_CLIENT_ID` | prod | — | From Kick developer portal |
| `KICK_CLIENT_SECRET` | prod | — | Server-only; never expose to `app/` |
| `KICK_REDIRECT_URI` | no | `{APP_URL}/auth/oauth/kick/callback` | Must match Kick app registration exactly |
| `APP_URL` | yes | `http://localhost:5173` | Post-login redirect target and default callback host |

Configure variables in `server/.env` (not committed to git).

## Dev flow (mock)

1. `KICK_OAUTH_MOCK=true` (default).
2. `GET /auth/oauth/kick` redirects straight to callback with `code=mock-kick-code`.
3. `KickOAuthService.exchangeCodeForProfile` returns a fixed mock profile.
4. E2e tests rely on this path — keep mock stable.

## Production flow (OAuth 2.1 + PKCE)

### 1. Register Kick developer app

- Create app at Kick developer portal.
- Redirect URI: `{APP_URL}/auth/oauth/kick/callback` (in dev, `http://localhost:5173/auth/oauth/kick/callback` via Vite proxy to server).
- Scopes for login: `user:read channel:read` (minimum to resolve username and channel).

### 2. Authorize (`GET /auth/oauth/kick`)

Generate per request:

- `code_verifier` — random 43–128 char string.
- `code_challenge` — base64url(SHA256(code_verifier)).
- `state` — random value bound to session (stores `code_verifier` or its lookup key).

Redirect browser to:

```
GET https://id.kick.com/oauth/authorize
  ?response_type=code
  &client_id={KICK_CLIENT_ID}
  &redirect_uri={KICK_REDIRECT_URI}
  &scope=user:read channel:read
  &state={state}
  &code_challenge={code_challenge}
  &code_challenge_method=S256
```

**Current gap:** none for server-side OAuth; ensure `KICK_REDIRECT_URI` matches Kick portal exactly.

### 3. Callback (`GET /auth/oauth/kick/callback`)

1. Validate `state` against session-stored value; reject on mismatch.
2. Exchange `code` immediately (single-use, short-lived):

```
POST https://id.kick.com/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&client_id={KICK_CLIENT_ID}
&client_secret={KICK_CLIENT_SECRET}
&redirect_uri={KICK_REDIRECT_URI}
&code={code}
&code_verifier={code_verifier}
```

3. Fetch profile:

```
GET https://api.kick.com/public/v1/users
Authorization: Bearer {access_token}
```

Map response to `KickProfile`: `providerUserId`, `username`, `channelId`, `channelSlug`.

4. Call `provisionOwnerFromKick` or reuse existing credential; set session; redirect to `{APP_URL}/dashboard`.

### 4. Token handling

- Use access token only at login to resolve identity.
- Do not persist refresh tokens in MVP (non-goal in SPEC.md).
- Discard tokens after profile fetch.

## Routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/auth/oauth/kick` | Start OAuth (guest) |
| GET | `/auth/oauth/kick/callback` | Complete OAuth (guest) |

Frontend entry: `kickLoginUrl()` → `/auth/oauth/kick` (proxied in dev).

## Brownfield status

| Area | Status |
|------|--------|
| Routes + session on callback | Implemented |
| Mock OAuth | Implemented |
| Login UI + landing CTA | Implemented |
| Auto-provision on callback | Implemented |
| PKCE + state validation | Implemented |
| Real token exchange + profile fetch | Implemented |

## Security notes

- Store `code_verifier` server-side (session), never in URL except via bound `state` lookup.
- Reject callback missing `code` or with invalid `state`.
- Keep `KICK_CLIENT_SECRET` out of logs and client bundles.
