-- Brownfield: 033 may have been applied before winner_chat_announced existed in that file.
ALTER TABLE growing_jackpot_round
  ADD COLUMN IF NOT EXISTS winner_chat_announced BOOLEAN NOT NULL DEFAULT false;
