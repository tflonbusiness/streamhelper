-- Viewer playlist settings for Media Interactive.

BEGIN;

ALTER TABLE media_interactive_settings
  ADD COLUMN IF NOT EXISTS viewer_playlists_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS max_playlist_tracks INTEGER NOT NULL DEFAULT 10;

COMMIT;
