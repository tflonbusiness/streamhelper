ALTER TABLE prize_spin DROP CONSTRAINT IF EXISTS prize_spin_status_check;

DROP INDEX IF EXISTS idx_prize_spin_account_created;

UPDATE prize_spin
SET status = 'off_air'
WHERE status = 'active';

WITH newest AS (
  SELECT DISTINCT ON (account_id) id
  FROM prize_spin
  WHERE status = 'off_air'
  ORDER BY account_id, created_at DESC
)
UPDATE prize_spin ps
SET status = 'live'
FROM newest n
WHERE ps.id = n.id;

ALTER TABLE prize_spin
  ALTER COLUMN status SET DEFAULT 'off_air';

ALTER TABLE prize_spin
  ADD CONSTRAINT prize_spin_status_check
  CHECK (status IN ('live', 'off_air', 'archived'));

CREATE INDEX idx_prize_spin_account_created
  ON prize_spin (account_id, created_at DESC)
  WHERE status != 'archived';

CREATE UNIQUE INDEX idx_prize_spin_account_live
  ON prize_spin (account_id)
  WHERE status = 'live';
