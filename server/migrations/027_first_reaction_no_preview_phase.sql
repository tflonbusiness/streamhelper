-- Close legacy preview draws; only one accepting draw per session.

UPDATE first_reaction_draw
SET
  phase = 'closed',
  result = 'cancelled',
  closed_at = COALESCE(closed_at, now()),
  fulfillment_status = 'not_applicable'
WHERE phase = 'preview';

DROP INDEX IF EXISTS idx_first_reaction_draw_one_in_progress;

CREATE UNIQUE INDEX idx_first_reaction_draw_one_accepting
  ON first_reaction_draw (first_reaction_id)
  WHERE phase = 'accepting';
