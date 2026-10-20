-- Default new accounts to audio-only overlay (no visible YouTube frame).

ALTER TABLE media_interactive_settings
  ALTER COLUMN show_video SET DEFAULT FALSE;
