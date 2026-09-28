-- Replace channel_follower with viewer (follower vs non-follower are indistinguishable in Kick chat).

UPDATE chat_roll
SET role_settings =
  (role_settings - 'channel_follower')
  || jsonb_build_object(
    'viewer',
    COALESCE(
      role_settings->'channel_follower',
      '{"enabled": true, "weight": 1}'::jsonb
    )
  )
WHERE role_settings ? 'channel_follower'
   OR NOT role_settings ? 'viewer';

UPDATE chat_roll
SET role_settings = role_settings - 'channel_follower'
WHERE role_settings ? 'channel_follower';

UPDATE chat_roll_participant
SET role_ids = (
  SELECT COALESCE(array_agg(
    CASE WHEN role_id = 'channel_follower' THEN 'viewer' ELSE role_id END
  ), '{}')
  FROM unnest(role_ids) AS role_id
)
WHERE 'channel_follower' = ANY(role_ids);

UPDATE chat_roll_participant
SET role_ids = array_append(role_ids, 'viewer')
WHERE cardinality(role_ids) = 0
  AND is_archived = false;
