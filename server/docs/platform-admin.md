# Platform admin (subscriptions)

Internal operators use the **service portal** — separate from the streamer app shell.

## Grant platform admin

Platform admins are stored in `platform_admins`. An active row has `revoked_at IS NULL`.

```sql
INSERT INTO platform_admins (user_id, note)
VALUES (:user_id, 'ops')
ON CONFLICT (user_id) DO UPDATE
SET revoked_at = NULL, note = EXCLUDED.note, granted_at = now();
```

## Sign-in flow

1. Everyone signs in on **`/`** (Kick) — there is no public link to the service portal.
2. After OAuth, **non-admins** go to **`/dashboard`**.
3. **Platform admins** go to **`/continue`** and choose:
   - **Streamer dashboard** — normal product
   - **Service portal** — `/service/subscriptions`
4. Admins can reopen the chooser via **Switch workspace** in the streamer sidebar or service sidebar.

Direct URLs `/service/*` still require `platform_admins`; non-admins are sent to the dashboard.

## API

See previous sections for `/internal/subscriptions` and `POST /auth/surface`.

## Audit

```sql
SELECT id, operator_user_id, account_id, payload_before, payload_after, created_at
FROM subscription_admin_events
WHERE account_id = :account_id
ORDER BY created_at DESC
LIMIT 20;
```
