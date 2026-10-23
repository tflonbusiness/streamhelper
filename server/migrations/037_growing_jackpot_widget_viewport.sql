-- Tighter OBS browser source: horizontal bar instead of 500×500 square.
ALTER TABLE growing_jackpot_widget
  ALTER COLUMN width SET DEFAULT 640,
  ALTER COLUMN height SET DEFAULT 176;

UPDATE growing_jackpot_widget
SET
  width = 640,
  height = 176,
  updated_at = now()
WHERE width = 500 AND height = 500;
