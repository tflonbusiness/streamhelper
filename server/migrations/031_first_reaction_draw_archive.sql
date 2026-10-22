-- Soft-delete draw history rows (operator UI: archive / remove from list).

ALTER TABLE first_reaction_draw
  ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_first_reaction_draw_history_active
  ON first_reaction_draw (first_reaction_id, created_at DESC)
  WHERE is_archived = false;
