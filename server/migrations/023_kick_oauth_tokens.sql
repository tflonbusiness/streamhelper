ALTER TABLE auth_credentials
  ADD COLUMN IF NOT EXISTS oauth_access_token TEXT,
  ADD COLUMN IF NOT EXISTS oauth_refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS oauth_access_token_expires_at TIMESTAMPTZ;
