ALTER TABLE chat_roll
  ADD COLUMN IF NOT EXISTS winner_response_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS winner_response_seconds INTEGER NOT NULL DEFAULT 60;

ALTER TABLE chat_roll_win
  ADD COLUMN IF NOT EXISTS response_status TEXT NOT NULL DEFAULT 'not_required',
  ADD COLUMN IF NOT EXISTS response_deadline_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

ALTER TABLE chat_roll_win
  DROP CONSTRAINT IF EXISTS chat_roll_win_response_status_check;

ALTER TABLE chat_roll_win
  ADD CONSTRAINT chat_roll_win_response_status_check
  CHECK (response_status IN ('pending', 'confirmed', 'no_response', 'not_required'));
