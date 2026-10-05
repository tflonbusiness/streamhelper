ALTER TABLE chat_roll_participant
  ADD COLUMN excluded_from_roll_pool BOOLEAN NOT NULL DEFAULT false;

-- Former winners were archived; mark them excluded from the roll pool.
UPDATE chat_roll_participant p
SET excluded_from_roll_pool = true
WHERE p.is_archived = true
  AND EXISTS (
    SELECT 1
    FROM chat_roll_win w
    WHERE w.participant_id = p.id
      AND w.chat_roll_id = p.chat_roll_id
  );

-- Same user may have re-joined (active row) while an archived winner row still exists.
UPDATE chat_roll_participant active
SET excluded_from_roll_pool = true
FROM chat_roll_participant archived
WHERE archived.is_archived = true
  AND archived.excluded_from_roll_pool = true
  AND active.chat_roll_id = archived.chat_roll_id
  AND active.provider IS NOT DISTINCT FROM archived.provider
  AND active.provider_user_id IS NOT DISTINCT FROM archived.provider_user_id
  AND active.is_archived = false
  AND active.id <> archived.id;

-- Restore visibility only when unarchive would not violate idx_chat_roll_participant_dedup.
-- At most one archived row per (chat_roll_id, provider, provider_user_id): several archived
-- duplicates can exist while is_archived = true; unarchiving them in one UPDATE hits the unique index.
UPDATE chat_roll_participant p
SET is_archived = false
FROM (
  SELECT DISTINCT ON (chat_roll_id, provider, provider_user_id)
    id
  FROM chat_roll_participant
  WHERE is_archived = true
    AND excluded_from_roll_pool = true
    AND provider IS NOT NULL
    AND provider_user_id IS NOT NULL
  ORDER BY chat_roll_id, provider, provider_user_id, id ASC
) pick
WHERE p.id = pick.id
  AND NOT EXISTS (
    SELECT 1
    FROM chat_roll_participant p2
    WHERE p2.chat_roll_id = p.chat_roll_id
      AND p2.provider IS NOT DISTINCT FROM p.provider
      AND p2.provider_user_id IS NOT DISTINCT FROM p.provider_user_id
      AND p2.is_archived = false
      AND p2.id <> p.id
  );

UPDATE chat_roll_participant p
SET is_archived = false
WHERE p.is_archived = true
  AND p.excluded_from_roll_pool = true
  AND (p.provider IS NULL OR p.provider_user_id IS NULL)
  AND NOT EXISTS (
    SELECT 1
    FROM chat_roll_participant p2
    WHERE p2.chat_roll_id = p.chat_roll_id
      AND p2.provider IS NOT DISTINCT FROM p.provider
      AND p2.provider_user_id IS NOT DISTINCT FROM p.provider_user_id
      AND p2.is_archived = false
      AND p2.id <> p.id
  );
