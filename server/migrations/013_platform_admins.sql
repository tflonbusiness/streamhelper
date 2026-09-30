CREATE TABLE platform_admins (
  user_id     BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  granted_by  BIGINT REFERENCES users(id) ON DELETE SET NULL,
  granted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at  TIMESTAMPTZ,
  note        TEXT
);

CREATE INDEX idx_platform_admins_active
  ON platform_admins (user_id)
  WHERE revoked_at IS NULL;
