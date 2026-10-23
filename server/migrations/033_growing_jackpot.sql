-- Growing Jackpot: timed pool giveaway with configurable join keyword.

CREATE TABLE growing_jackpot (
  id                          BIGSERIAL PRIMARY KEY,
  account_id                  BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_by_user_id          BIGINT NOT NULL REFERENCES users(id),
  title                       TEXT NOT NULL,

  status                      TEXT NOT NULL DEFAULT 'off_air'
    CHECK (status IN ('live', 'off_air', 'archived')),

  settings                    JSONB NOT NULL DEFAULT '{
    "joinKeyword": "!join",
    "timerSeconds": 300,
    "prizeBase": 0,
    "prizeStepPerJoin": 1,
    "prizeDisplayCap": null,
    "weightCombineMode": "highest",
    "announceWinnerInChat": true,
    "winnerOverlaySeconds": 8,
    "roleSettings": {
      "moderator":         { "enabled": false, "weight": 1 },
      "vip":               { "enabled": true, "weight": 1 },
      "og":                { "enabled": false, "weight": 1 },
      "viewer":            { "enabled": true, "weight": 1 },
      "paid_subscriber":   { "enabled": true, "weight": 1 }
    }
  }'::jsonb,

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_growing_jackpot_account_created
  ON growing_jackpot (account_id, created_at DESC)
  WHERE status != 'archived';

CREATE UNIQUE INDEX idx_growing_jackpot_account_live
  ON growing_jackpot (account_id)
  WHERE status = 'live';


CREATE TABLE growing_jackpot_round (
  id                          BIGSERIAL PRIMARY KEY,
  growing_jackpot_id          BIGINT NOT NULL REFERENCES growing_jackpot(id) ON DELETE CASCADE,
  round_index                 INTEGER NOT NULL DEFAULT 1,

  join_keyword                TEXT NOT NULL,
  settings_snapshot           JSONB NOT NULL,

  phase                       TEXT NOT NULL DEFAULT 'accepting'
    CHECK (phase IN ('accepting', 'drawing', 'closed')),

  result                      TEXT
    CHECK (result IS NULL OR result IN (
      'won', 'no_participants', 'stopped', 'cancelled'
    )),

  ends_at                     TIMESTAMPTZ NOT NULL,
  participant_count           INTEGER NOT NULL DEFAULT 0,
  display_prize               NUMERIC(12, 2) NOT NULL DEFAULT 0,

  closed_at                   TIMESTAMPTZ,

  winner_provider             TEXT
    CHECK (winner_provider IS NULL OR winner_provider IN ('kick', 'twitch', 'youtube')),
  winner_provider_user_id     TEXT,
  winner_display_name         TEXT,
  winner_participant_id       BIGINT,

  rng_seed                    TEXT,
  proof_token                 TEXT UNIQUE,
  winner_chat_announced       BOOLEAN NOT NULL DEFAULT false,
  fulfillment_status          TEXT NOT NULL DEFAULT 'pending'
    CHECK (fulfillment_status IN ('pending', 'fulfilled', 'not_applicable')),
  fulfilled_at                TIMESTAMPTZ,
  fulfilled_by_user_id        BIGINT REFERENCES users(id),

  started_by_user_id          BIGINT NOT NULL REFERENCES users(id),
  stopped_by_user_id          BIGINT REFERENCES users(id),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_growing_jackpot_round_one_in_progress
  ON growing_jackpot_round (growing_jackpot_id)
  WHERE phase IN ('accepting', 'drawing');

CREATE INDEX idx_growing_jackpot_round_history
  ON growing_jackpot_round (growing_jackpot_id, created_at DESC);

CREATE INDEX idx_growing_jackpot_round_accepting_ends
  ON growing_jackpot_round (ends_at)
  WHERE phase = 'accepting';


CREATE TABLE growing_jackpot_participant (
  id                  BIGSERIAL PRIMARY KEY,
  round_id            BIGINT NOT NULL REFERENCES growing_jackpot_round(id) ON DELETE CASCADE,
  provider            TEXT NOT NULL
    CHECK (provider IN ('kick', 'twitch', 'youtube')),
  provider_user_id    TEXT NOT NULL,
  display_name        TEXT NOT NULL,
  role_ids            TEXT[] NOT NULL DEFAULT '{}',
  joined_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_growing_jackpot_participant_dedup
  ON growing_jackpot_participant (round_id, provider, provider_user_id);

CREATE INDEX idx_growing_jackpot_participant_list
  ON growing_jackpot_participant (round_id, joined_at ASC);


CREATE TABLE growing_jackpot_widget (
  id                  BIGSERIAL PRIMARY KEY,
  account_id          BIGINT NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  width               INTEGER NOT NULL DEFAULT 500,
  height              INTEGER NOT NULL DEFAULT 500,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
