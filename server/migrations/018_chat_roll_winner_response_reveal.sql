ALTER TABLE chat_roll
  ADD COLUMN IF NOT EXISTS show_winner_response_in_reveal BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE chat_roll_win
  ADD COLUMN IF NOT EXISTS winner_response_message TEXT;
