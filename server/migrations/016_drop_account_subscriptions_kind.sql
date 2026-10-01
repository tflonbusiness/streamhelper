-- plan_tier (trial | pro | max) is the single tier axis; kind (trial | paid) is redundant.
UPDATE account_subscriptions s
SET plan_tier = COALESCE(NULLIF(a.subscription_plan, 'free'), 'pro'),
    updated_at = now()
FROM accounts a
WHERE a.id = s.account_id
  AND s.kind = 'paid'
  AND s.plan_tier = 'trial'
  AND a.subscription_plan IN ('pro', 'max');

UPDATE account_subscriptions s
SET plan_tier = 'pro', updated_at = now()
WHERE kind = 'paid'
  AND plan_tier = 'trial';

ALTER TABLE account_subscriptions
  DROP COLUMN kind;
