-- Initial schema (idempotent objects use IF NOT EXISTS where safe for extensions only)

CREATE TABLE users (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
CREATE INDEX idx_auth_credentials_token_hash ON auth_credentials(token_hash)
  WHERE token_hash IS NOT NULL;

CREATE TABLE accounts (
  id                BIGSERIAL PRIMARY KEY,
  ucid              UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 100),
  subscription_plan TEXT NOT NULL DEFAULT 'free',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE account_members (
  id          BIGSERIAL PRIMARY KEY,
  account_id  BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('owner', 'moderator')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, user_id)
);

CREATE INDEX idx_members_user ON account_members(user_id);
CREATE INDEX idx_members_account ON account_members(account_id);

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

CREATE TABLE bonus_buy (
  id                  BIGSERIAL PRIMARY KEY,
  account_id          BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_by_user_id  BIGINT NOT NULL REFERENCES users(id),
  name                TEXT NOT NULL,
  start_balance       NUMERIC(12, 2) NOT NULL,
  currency_code       CHAR(3) NOT NULL DEFAULT 'USD',
  status              TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'archived')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bonus_buy_account_created
  ON bonus_buy (account_id, created_at DESC)
  WHERE status != 'archived';

CREATE TABLE bonus_buy_slot (
  id                  BIGSERIAL PRIMARY KEY,
  bonus_buy_id        BIGINT NOT NULL REFERENCES bonus_buy(id) ON DELETE CASCADE,
  created_by_user_id  BIGINT NOT NULL REFERENCES users(id),
  name                TEXT NOT NULL,
  provider_name       TEXT,
  purchase_amount     NUMERIC(12, 2) NOT NULL,
  win_amount          NUMERIC(12, 2),
  multiplier          NUMERIC(10, 2),
  status              TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'playing', 'archived')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_bonus_buy_slot_one_playing
  ON bonus_buy_slot (bonus_buy_id)
  WHERE status = 'playing';

CREATE INDEX idx_bonus_buy_slot_list
  ON bonus_buy_slot (bonus_buy_id, created_at ASC)
  WHERE status != 'archived';

CREATE TABLE bonus_buy_widget_style_preset (
  id                  BIGSERIAL PRIMARY KEY,
  account_id          BIGINT REFERENCES accounts(id) ON DELETE CASCADE,
  created_by_user_id  BIGINT REFERENCES users(id),
  source              TEXT NOT NULL CHECK (source IN ('system', 'user')),
  name                TEXT NOT NULL,
  style_settings      JSONB NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (source = 'system' AND account_id IS NULL AND created_by_user_id IS NULL)
    OR (source = 'user' AND account_id IS NOT NULL AND created_by_user_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX idx_bonus_buy_widget_style_preset_system_name
  ON bonus_buy_widget_style_preset (name)
  WHERE source = 'system';

CREATE UNIQUE INDEX idx_bonus_buy_widget_style_preset_account_user
  ON bonus_buy_widget_style_preset (account_id)
  WHERE source = 'user';

CREATE TABLE bonus_buy_widget (
  id                  BIGSERIAL PRIMARY KEY,
  bonus_buy_id        BIGINT NOT NULL UNIQUE REFERENCES bonus_buy(id) ON DELETE CASCADE,
  width               INTEGER NOT NULL DEFAULT 500,
  height              INTEGER NOT NULL DEFAULT 600,
  preset_id           BIGINT NOT NULL REFERENCES bonus_buy_widget_style_preset(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE prize_spin (
  id                  BIGSERIAL PRIMARY KEY,
  account_id          BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_by_user_id  BIGINT NOT NULL REFERENCES users(id),
  title               TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'archived')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prize_spin_account_created
  ON prize_spin (account_id, created_at DESC)
  WHERE status = 'active';

CREATE TABLE prize_spin_sector (
  id                  BIGSERIAL PRIMARY KEY,
  prize_spin_id       BIGINT NOT NULL REFERENCES prize_spin(id) ON DELETE CASCADE,
  label               TEXT NOT NULL,
  win_percent         NUMERIC(5, 2) NOT NULL
    CHECK (win_percent > 0 AND win_percent <= 100),
  color               TEXT,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  is_archived         BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prize_spin_sector_wheel
  ON prize_spin_sector (prize_spin_id, sort_order ASC, id ASC)
  WHERE is_archived = false;

CREATE TABLE prize_spin_win (
  id                  BIGSERIAL PRIMARY KEY,
  prize_spin_id       BIGINT NOT NULL REFERENCES prize_spin(id) ON DELETE CASCADE,
  sector_id           BIGINT NOT NULL REFERENCES prize_spin_sector(id),
  participant_nick    TEXT NOT NULL,
  spun_by_user_id     BIGINT NOT NULL REFERENCES users(id),
  is_archived         BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prize_spin_win_history
  ON prize_spin_win (prize_spin_id, created_at DESC)
  WHERE is_archived = false;

CREATE TABLE prize_spin_widget (
  id                  BIGSERIAL PRIMARY KEY,
  account_id          BIGINT NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  width               INTEGER NOT NULL DEFAULT 500,
  height              INTEGER NOT NULL DEFAULT 500,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE chat_roll (
  id                          BIGSERIAL PRIMARY KEY,
  account_id                  BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_by_user_id          BIGINT NOT NULL REFERENCES users(id),
  title                       TEXT NOT NULL,
  status                      TEXT NOT NULL DEFAULT 'off_air'
    CHECK (status IN ('live', 'off_air', 'archived')),
  keyword                     TEXT NOT NULL DEFAULT '!roll',
  combine_mode                TEXT NOT NULL DEFAULT 'highest'
    CHECK (combine_mode IN ('highest', 'sum')),
  exclude_winner_after_roll   BOOLEAN NOT NULL DEFAULT true,
  is_accepting_participants   BOOLEAN NOT NULL DEFAULT true,
  reply_in_chat               BOOLEAN NOT NULL DEFAULT false,
  role_settings               JSONB NOT NULL DEFAULT '{
    "moderator":         { "enabled": false, "weight": 1 },
    "vip":               { "enabled": true,  "weight": 2 },
    "og":                { "enabled": false, "weight": 1.5 },
    "channel_follower":  { "enabled": false, "weight": 1 },
    "paid_subscriber":   { "enabled": true,  "weight": 2 }
  }'::jsonb,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_roll_account_created
  ON chat_roll (account_id, created_at DESC)
  WHERE status != 'archived';

CREATE UNIQUE INDEX idx_chat_roll_account_live
  ON chat_roll (account_id)
  WHERE status = 'live';

CREATE TABLE chat_roll_participant (
  id                  BIGSERIAL PRIMARY KEY,
  chat_roll_id        BIGINT NOT NULL REFERENCES chat_roll(id) ON DELETE CASCADE,
  provider            TEXT
    CHECK (provider IS NULL OR provider IN ('kick', 'twitch', 'youtube')),
  provider_user_id    TEXT,
  display_name        TEXT NOT NULL,
  role_ids            TEXT[] NOT NULL DEFAULT '{}',
  is_archived         BOOLEAN NOT NULL DEFAULT false,
  joined_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_roll_participant_list
  ON chat_roll_participant (chat_roll_id, joined_at ASC)
  WHERE is_archived = false;

CREATE UNIQUE INDEX idx_chat_roll_participant_dedup
  ON chat_roll_participant (chat_roll_id, provider, provider_user_id)
  WHERE provider IS NOT NULL
    AND provider_user_id IS NOT NULL
    AND is_archived = false;

CREATE TABLE chat_roll_win (
  id                  BIGSERIAL PRIMARY KEY,
  chat_roll_id        BIGINT NOT NULL REFERENCES chat_roll(id) ON DELETE CASCADE,
  participant_id      BIGINT NOT NULL REFERENCES chat_roll_participant(id),
  display_name        TEXT NOT NULL,
  coefficient_at_pick NUMERIC(5, 1) NOT NULL,
  rolled_by_user_id   BIGINT NOT NULL REFERENCES users(id),
  roll_index          INTEGER NOT NULL DEFAULT 1,
  is_archived         BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_roll_win_history
  ON chat_roll_win (chat_roll_id, created_at DESC)
  WHERE is_archived = false;

CREATE TABLE chat_roll_widget (
  id                  BIGSERIAL PRIMARY KEY,
  account_id          BIGINT NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  width               INTEGER NOT NULL DEFAULT 500,
  height              INTEGER NOT NULL DEFAULT 500,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE kick_chat_events (
  message_id      TEXT PRIMARY KEY,
  broadcaster_id  TEXT NOT NULL,
  sender_id       TEXT NOT NULL,
  content         TEXT NOT NULL,
  received_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kick_chat_events_broadcaster
  ON kick_chat_events (broadcaster_id, received_at DESC);
