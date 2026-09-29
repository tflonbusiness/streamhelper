ALTER TABLE bonus_buy DROP CONSTRAINT IF EXISTS bonus_buy_status_check;

DROP INDEX IF EXISTS idx_bonus_buy_account_created;

UPDATE bonus_buy
SET status = 'off_air'
WHERE status = 'active';

WITH newest AS (
  SELECT DISTINCT ON (account_id) id
  FROM bonus_buy
  WHERE status = 'off_air'
  ORDER BY account_id, created_at DESC
)
UPDATE bonus_buy bb
SET status = 'live'
FROM newest n
WHERE bb.id = n.id;

ALTER TABLE bonus_buy
  ALTER COLUMN status SET DEFAULT 'off_air';

ALTER TABLE bonus_buy
  ADD CONSTRAINT bonus_buy_status_check
  CHECK (status IN ('live', 'off_air', 'archived'));

CREATE INDEX idx_bonus_buy_account_created
  ON bonus_buy (account_id, created_at DESC)
  WHERE status != 'archived';

CREATE UNIQUE INDEX idx_bonus_buy_account_live
  ON bonus_buy (account_id)
  WHERE status = 'live';
