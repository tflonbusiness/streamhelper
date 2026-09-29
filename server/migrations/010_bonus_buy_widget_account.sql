-- One bonus buy widget row per account (module-level overlay settings).

ALTER TABLE bonus_buy_widget
  ADD COLUMN IF NOT EXISTS account_id BIGINT REFERENCES accounts(id) ON DELETE CASCADE;

UPDATE bonus_buy_widget w
SET account_id = bb.account_id
FROM bonus_buy bb
WHERE w.account_id IS NULL
  AND bb.id = w.bonus_buy_id;

DELETE FROM bonus_buy_widget w
WHERE w.account_id IS NULL
   OR w.id NOT IN (
     SELECT DISTINCT ON (account_id) id
     FROM bonus_buy_widget
     WHERE account_id IS NOT NULL
     ORDER BY account_id, updated_at DESC, id DESC
   );

ALTER TABLE bonus_buy_widget
  DROP CONSTRAINT IF EXISTS bonus_buy_widget_bonus_buy_id_key;

ALTER TABLE bonus_buy_widget
  DROP COLUMN IF EXISTS bonus_buy_id;

ALTER TABLE bonus_buy_widget
  ALTER COLUMN account_id SET NOT NULL;

ALTER TABLE bonus_buy_widget
  ADD CONSTRAINT bonus_buy_widget_account_id_key UNIQUE (account_id);
