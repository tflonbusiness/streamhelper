# Postgres schema: users, accounts, account_members

Canonical DDL for CAP-1 through CAP-10. Numeric surrogate keys; timestamps on every table.

## Tables

```sql
CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE accounts (
  id            BIGSERIAL PRIMARY KEY,
  owner_user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
  name          TEXT NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 100),
  is_active     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE account_members (
  account_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('owner', 'moderator')),
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, user_id),
  CONSTRAINT account_members_owner_matches_account CHECK (
    role <> 'owner'
    OR user_id = (SELECT owner_user_id FROM accounts a WHERE a.id = account_id)
  )
);

CREATE INDEX idx_members_user ON account_members(user_id);
CREATE INDEX idx_members_account ON account_members(account_id);
```

Store `accounts.name` as trimmed text from application code (or `btrim` before insert).

## Field semantics

| Table | Field | Meaning |
|-------|-------|---------|
| `users` | `email` | Login identifier; unique |
| `accounts` | `name` | Display label; 2–100 chars after trim; not globally unique |
| `accounts` | `owner_user_id` | Paying owner; unique — one owned account per user |
| `accounts` | `is_active` | Team subscription; demo toggled via seed + dev SQL |
| `account_members` | `role` | `owner` or `moderator` |
| `account_members` | `is_active` | Moderator access toggle; owner row not disabled this way |

## API contracts (reference)

### GET /auth/memberships

Returns active memberships for session user:

```json
[
  { "accountId": 1, "name": "Моя команда", "role": "owner", "accountIsActive": false }
]
```

### POST /auth/select-account

Body: `{ "accountId": 1 }`. Verifies `account_members` row with `is_active=true`. Sets session: `accountId`, `accountName`, `role`, `accountIsActive`.

### POST /accounts (create owned account)

Body: `{ "name": "Моя команда" }`. Rejects if user already owns an account. Creates account + owner membership.

### POST /accounts/:id/members

Owner only. Body: `{ "email": "moderator@example.com" }`. Adds or reactivates moderator.

### PATCH /accounts/:id/members/:userId

Owner only. Body: `{ "isActive": false }`. Moderator rows only.

## Dev: toggle subscription

Documented SQL for local/demo:

```sql
UPDATE accounts SET is_active = true, updated_at = now() WHERE id = $1;
```

Seed includes at least one active and one inactive account for demo logins.

## Post-login router

| Active memberships | Next step |
|--------------------|-------------|
| 0 | Onboarding: create account or wait |
| 1 | Auto `select-account` |
| 2+ | `/dashboard` picker mode → `select-account` |
| Selected | CAP-6: dashboard or contact-to-pay |

## Session shape

```typescript
type SessionUser = {
  id: number;
  email: string;
  accountId?: number;
  accountName?: string;
  role?: 'owner' | 'moderator';
  accountIsActive?: boolean;
};
```
