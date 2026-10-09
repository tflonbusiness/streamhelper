ALTER TABLE bonus_buy_slot
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 1;

UPDATE bonus_buy_slot s
SET sort_order = sub.rn
FROM (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY bonus_buy_id
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM bonus_buy_slot
  WHERE status != 'archived'
) sub
WHERE s.id = sub.id;

DROP INDEX IF EXISTS idx_bonus_buy_slot_list;
CREATE INDEX idx_bonus_buy_slot_list
  ON bonus_buy_slot (bonus_buy_id, sort_order ASC, id ASC)
  WHERE status != 'archived';
