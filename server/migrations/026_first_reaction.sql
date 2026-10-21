-- First Reaction: manual or generated keyword per draw; streamer-triggered giveaways.

CREATE TABLE first_reaction (
  id                          BIGSERIAL PRIMARY KEY,
  account_id                  BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_by_user_id          BIGINT NOT NULL REFERENCES users(id),
  title                       TEXT NOT NULL,

  status                      TEXT NOT NULL DEFAULT 'off_air'
    CHECK (status IN ('live', 'off_air', 'archived')),

  settings                    JSONB NOT NULL DEFAULT '{
    "wordSource": "manual",
    "manualScope": "per_draw",
    "sessionKeyword": null,
    "generationPool": "builtin_casino",
    "customWords": [],
    "avoidRepeatUntilPoolExhausted": true,
    "acceptTimeoutEnabled": true,
    "acceptTimeoutSeconds": 10,
    "onTimeout": "close_no_winner",
    "preAcceptDelayMs": 0,
    "startCooldownEnabled": false,
    "startCooldownSeconds": 30,
    "autoSeriesEnabled": false,
    "autoSeriesLength": 1,
    "announceWinnerInChat": true,
    "winnerOverlaySeconds": 8,
    "roleSettings": {
      "moderator":         { "enabled": false },
      "vip":               { "enabled": true },
      "og":                { "enabled": false },
      "channel_follower":  { "enabled": false },
      "paid_subscriber":   { "enabled": true }
    }
  }'::jsonb,

  next_start_allowed_at       TIMESTAMPTZ,

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_first_reaction_account_created
  ON first_reaction (account_id, created_at DESC)
  WHERE status != 'archived';

CREATE UNIQUE INDEX idx_first_reaction_account_live
  ON first_reaction (account_id)
  WHERE status = 'live';


CREATE TABLE first_reaction_draw (
  id                          BIGSERIAL PRIMARY KEY,
  first_reaction_id           BIGINT NOT NULL REFERENCES first_reaction(id) ON DELETE CASCADE,
  draw_index                  INTEGER NOT NULL DEFAULT 1,

  keyword                     TEXT NOT NULL,
  keyword_source              TEXT NOT NULL
    CHECK (keyword_source IN ('manual', 'generated')),
  generation_meta             JSONB,

  settings_snapshot           JSONB NOT NULL,

  phase                       TEXT NOT NULL DEFAULT 'preview'
    CHECK (phase IN ('preview', 'accepting', 'closed')),

  result                      TEXT
    CHECK (result IS NULL OR result IN (
      'won', 'expired', 'stopped', 'no_winner', 'cancelled'
    )),

  preview_started_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepting_started_at        TIMESTAMPTZ,
  accept_deadline_at          TIMESTAMPTZ,
  closed_at                   TIMESTAMPTZ,

  stopped_by_user_id          BIGINT REFERENCES users(id),

  winner_provider             TEXT
    CHECK (winner_provider IS NULL OR winner_provider IN ('kick', 'twitch', 'youtube')),
  winner_provider_user_id     TEXT,
  winner_display_name         TEXT,
  winning_message_id          TEXT REFERENCES kick_chat_events(message_id),
  won_at                      TIMESTAMPTZ,

  proof_token                 TEXT UNIQUE,
  fulfillment_status          TEXT NOT NULL DEFAULT 'pending'
    CHECK (fulfillment_status IN ('pending', 'fulfilled', 'not_applicable')),
  fulfilled_at                TIMESTAMPTZ,
  fulfilled_by_user_id        BIGINT REFERENCES users(id),

  started_by_user_id          BIGINT NOT NULL REFERENCES users(id),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_first_reaction_draw_one_in_progress
  ON first_reaction_draw (first_reaction_id)
  WHERE phase IN ('preview', 'accepting');

CREATE INDEX idx_first_reaction_draw_history
  ON first_reaction_draw (first_reaction_id, created_at DESC);

CREATE INDEX idx_first_reaction_draw_accepting
  ON first_reaction_draw (first_reaction_id)
  WHERE phase = 'accepting';


CREATE TABLE first_reaction_widget (
  id                  BIGSERIAL PRIMARY KEY,
  account_id          BIGINT NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  width               INTEGER NOT NULL DEFAULT 500,
  height              INTEGER NOT NULL DEFAULT 500,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
