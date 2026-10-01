-- Normalize plan_tier to trial | pro | max (replace legacy full / studio naming in tier column).
UPDATE account_subscriptions
SET plan_tier = 'trial', updated_at = now()
WHERE plan_tier = 'full';

UPDATE account_subscriptions
SET plan_tier = 'max', updated_at = now()
WHERE plan_tier = 'studio';

UPDATE accounts
SET subscription_plan = 'max', updated_at = now()
WHERE subscription_plan = 'studio';

UPDATE account_subscriptions
SET plan_tier = 'pro', updated_at = now()
WHERE plan_tier NOT IN ('trial', 'pro', 'max')
  AND EXISTS (
    SELECT 1 FROM accounts a
    WHERE a.id = account_subscriptions.account_id
      AND a.subscription_plan = 'pro'
  );

ALTER TABLE account_subscriptions
  ALTER COLUMN plan_tier SET DEFAULT 'trial';
