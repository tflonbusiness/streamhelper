-- Separate OBS bar width for audio-only overlay mode.

BEGIN;

ALTER TABLE media_interactive_settings
  ADD COLUMN IF NOT EXISTS audio_overlay_width INTEGER NOT NULL DEFAULT 400;

COMMIT;
