-- Soft-delete round history rows (operator UI: archive / remove from list).

ALTER TABLE growing_jackpot_round
  ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_growing_jackpot_round_history_active
  ON growing_jackpot_round (growing_jackpot_id, created_at DESC)
  WHERE is_archived = false;
