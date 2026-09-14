-- Dev/demo: activate a team subscription (accounts.is_active)
-- Usage: psql $DATABASE_URL -v account_id=1 -f docs/dev-activate-account.sql

UPDATE accounts
SET is_active = true, updated_at = now()
WHERE id = :account_id;

-- Verify:
-- SELECT id, name, owner_user_id, is_active FROM accounts WHERE id = :account_id;
