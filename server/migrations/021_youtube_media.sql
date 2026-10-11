-- Media Interactive module schema (migration version 021_youtube_media).

BEGIN;

CREATE TABLE IF NOT EXISTS media_interactive_item (
  id                  BIGSERIAL PRIMARY KEY,
  account_id          BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  list_kind           TEXT NOT NULL CHECK (list_kind IN ('queue', 'backup')),
  source              TEXT NOT NULL CHECK (source IN ('viewer', 'staff')),
  youtube_url         TEXT NOT NULL,
  youtube_video_id    TEXT NOT NULL,
  title               TEXT NOT NULL DEFAULT '',
  duration_seconds    INTEGER NOT NULL DEFAULT 0,
  requester_nick      TEXT NOT NULL DEFAULT '',
  points_charged      INTEGER NOT NULL DEFAULT 0,
  kick_redemption_id  TEXT,
  status              TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('pending', 'queued', 'playing', 'played', 'skipped', 'failed', 'rejected')),
  reject_reason       TEXT,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media_interactive_settings (
  account_id                          BIGINT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  volume                              INTEGER NOT NULL DEFAULT 80,
  show_video                          BOOLEAN NOT NULL DEFAULT TRUE,
  overlay_width                       INTEGER NOT NULL DEFAULT 640,
  overlay_height                      INTEGER NOT NULL DEFAULT 360,
  backup_cutover                      TEXT NOT NULL DEFAULT 'immediate'
    CHECK (backup_cutover IN ('immediate', 'finish_current_track')),
  max_viewer_track_duration_seconds   INTEGER NOT NULL DEFAULT 600,
  kick_reward_ids                     JSONB NOT NULL DEFAULT '[]'::jsonb,
  playback_paused                     BOOLEAN NOT NULL DEFAULT FALSE,
  playing_item_id                     BIGINT,
  deferred_queue_item_id              BIGINT,
  active_source                       TEXT NOT NULL DEFAULT 'backup'
    CHECK (active_source IN ('queue', 'backup')),
  created_at                          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_media_interactive_kick_redemption
  ON media_interactive_item (kick_redemption_id)
  WHERE kick_redemption_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_media_interactive_account_list
  ON media_interactive_item (account_id, list_kind, sort_order ASC, id ASC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'media_interactive_settings_playing_item_fk'
  ) THEN
    ALTER TABLE media_interactive_settings
      ADD CONSTRAINT media_interactive_settings_playing_item_fk
      FOREIGN KEY (playing_item_id) REFERENCES media_interactive_item(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'media_interactive_settings_deferred_item_fk'
  ) THEN
    ALTER TABLE media_interactive_settings
      ADD CONSTRAINT media_interactive_settings_deferred_item_fk
      FOREIGN KEY (deferred_queue_item_id) REFERENCES media_interactive_item(id) ON DELETE SET NULL;
  END IF;
END $$;

COMMIT;
