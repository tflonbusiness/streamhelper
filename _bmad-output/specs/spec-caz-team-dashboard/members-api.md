# Members API — GET roster

New endpoint for admin roster on dashboard.

## `GET /accounts/:accountId/members`

Returns all `account_members` for the account joined with user email.

### Authorization

- Caller must be authenticated (`session.user`).
- Caller must have an **active** membership on `:accountId` (`account_members.is_active = true`).
- Any role (`owner` or `admin`) may read the roster.

### Response `200`

```json
{
  "members": [
    {
      "userId": 1,
      "email": "active@caz-agent.example",
      "role": "owner",
      "isActive": true
    },
    {
      "userId": 3,
      "email": "admin@caz-agent.example",
      "role": "admin",
      "isActive": true
    }
  ]
}
```

- Include both owner and admin rows.
- Order: owner first, then admins by email ascending.
- `isActive` reflects `account_members.is_active`.

### Errors

| Status | When |
|--------|------|
| 401 | No session |
| 403 | User is not an active member of the account |
| 404 | Account id not found (optional; may return 403 instead) |

## Existing endpoints — role changes

### `POST /accounts/:accountId/members`

- **Unchanged:** owner only (add admin by email).

### `PATCH /accounts/:accountId/members/:memberUserId`

- **Extend:** allow **owner or admin** caller when target row has `role = admin`.
- **Still forbid:** toggling owner row; non-members; admin caller targeting non-admin rows.
- Body: `{ "isActive": boolean }`

### Database

Add `listAccountMembers(accountId)` in `DatabaseService`:

```sql
SELECT u.id AS user_id, u.email, am.role, am.is_active
FROM account_members am
JOIN users u ON u.id = am.user_id
WHERE am.account_id = $1
ORDER BY CASE WHEN am.role = 'owner' THEN 0 ELSE 1 END, u.email
```

Add `isAccountMember(accountId, userId)` for GET auth check (active membership).

Update `setAdminActive` authorization: permit if caller is owner **or** (caller is active admin on same account **and** target is admin role).

## Frontend

Add `fetchAccountMembers(accountId)` in `app/src/api/auth.ts` (or `accounts.ts`).

Dashboard loads roster on mount when `user.accountId` is set; refresh after add/deactivate.
