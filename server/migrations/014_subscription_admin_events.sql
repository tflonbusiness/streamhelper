CREATE TABLE subscription_admin_events (
  id                BIGSERIAL PRIMARY KEY,
  operator_user_id  BIGINT NOT NULL REFERENCES users(id),
  account_id        BIGINT NOT NULL REFERENCES accounts(id),
  payload_before    JSONB NOT NULL,
  payload_after     JSONB NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscription_admin_events_account
  ON subscription_admin_events (account_id, created_at DESC);
