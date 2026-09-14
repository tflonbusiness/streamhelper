# Streaming OAuth auth — database schema

Source: brainstorming `brainstorm-kick-auth-login-2026-09-13`, SPEC.md resolved decisions.

**Provisioning rules:** `accounts.name` = Kick `provider_username` on auto-provision. One account per owner. Admin revoke is permanent (`is_active = false`, no reactivate).

## Tables

### `users`

Identity for owners and admins. No credentials on this table.

```sql
CREATE TABLE users (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `auth_credentials`

All login methods. One user may have multiple credentials (linked OAuth providers + optional `access_link` for admins).

```sql
CREATE TABLE auth_credentials (
  id                BIGSERIAL PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider          TEXT NOT NULL CHECK (provider IN ('kick', 'twitch', 'youtube', 'access_link')),
  provider_user_id  TEXT NOT NULL,
  provider_username TEXT,
  token_hash        TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_user_id)
);

CREATE INDEX idx_auth_credentials_user ON auth_credentials(user_id);
CREATE INDEX idx_auth_credentials_token_hash ON auth_credentials(token_hash) WHERE token_hash IS NOT NULL;
```

- OAuth providers: `provider_user_id` = platform user ID; `token_hash` = NULL.
- `access_link`: `provider_user_id` = internal stable ID (e.g. UUID); `token_hash` = bcrypt/argon hash of the join token; plain token shown once to owner.

### `accounts`

Workspace for a streamer team. Owner is determined via `account_members.role = 'owner'`, not `owner_user_id`.

```sql
CREATE TABLE accounts (
  id                BIGSERIAL PRIMARY KEY,
  name              TEXT NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 100),
  subscription_plan TEXT NOT NULL DEFAULT 'free',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`subscription_plan` replaces `accounts.is_active`. Tier limits are out of scope for this epic.

### `account_members`

Team membership and role.

```sql
CREATE TABLE account_members (
  id          BIGSERIAL PRIMARY KEY,
  account_id  BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('owner', 'admin')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, user_id)
);

CREATE INDEX idx_members_user ON account_members(user_id);
CREATE INDEX idx_members_account ON account_members(account_id);
```

Exactly one `owner` per account (enforced in application layer for this epic).

### `account_channels`

Streaming platform channels tied to an account.

```sql
CREATE TABLE account_channels (
  id           BIGSERIAL PRIMARY KEY,
  account_id   BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  provider     TEXT NOT NULL CHECK (provider IN ('kick', 'twitch', 'youtube')),
  channel_id   TEXT NOT NULL,
  channel_slug TEXT NOT NULL,
  is_primary   BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, channel_id)
);

CREATE INDEX idx_channels_account ON account_channels(account_id);
```

## Revoke admin (atomic)

```sql
-- 1. Deactivate credential and membership
UPDATE auth_credentials SET is_active = false, updated_at = now()
  WHERE user_id = :admin_user_id AND provider = 'access_link';
UPDATE account_members SET is_active = false, updated_at = now()
  WHERE user_id = :admin_user_id AND account_id = :account_id;
-- 2. Destroy server sessions for :admin_user_id (implementation-specific)
```

## Removed from Epic 1 / 2 model

| Removed | Replacement |
|---------|-------------|
| `users.email`, `users.password_hash` | `auth_credentials` |
| `accounts.owner_user_id` | `account_members.role = 'owner'` |
| `accounts.is_active` | `accounts.subscription_plan` |
