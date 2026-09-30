CREATE TABLE account_subscriptions (
  id           BIGSERIAL PRIMARY KEY,
  account_id   BIGINT NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  kind         TEXT NOT NULL CHECK (kind IN ('trial', 'paid')),
  status       TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled')),
  plan_tier    TEXT NOT NULL DEFAULT 'full',
  starts_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at      TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_account_subscriptions_active_ends
  ON account_subscriptions (ends_at)
  WHERE status = 'active';

INSERT INTO account_subscriptions (account_id, kind, status, plan_tier, starts_at, ends_at)
SELECT id, 'trial', 'active', 'full', now(), now() + interval '3 days'
FROM accounts
ON CONFLICT (account_id) DO NOTHING;
