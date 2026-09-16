# Members API — GET roster

New endpoint for moderator roster on team page.

## `GET /accounts/:accountId/members`

Returns all `account_members` for the account joined with user name.

### Authorization

- Caller must be authenticated (`session.user`).
- Caller must have an **active** membership on `:accountId` (`account_members.is_active = true`).
- Any role (`owner` or `moderator`) may read the roster.

### Response `200`

```json
{
  "members": [
    {
      "userId": 1,
      "name": "streamer_kick",
      "role": "owner",
      "isActive": true
    },
    {
      "userId": 3,
      "name": "demo_moderator",
      "role": "moderator",
      "isActive": true
    }
  ]
}
```

- Include both owner and moderator rows.
- Order: owner first, then moderators by name ascending.
- `isActive` reflects `account_members.is_active`.

### Errors

| Status | When |
|--------|------|
| 401 | No session |
| 403 | User is not an active member of the account |
| 404 | Account id not found (optional; may return 403 instead) |

## Existing endpoints — role changes

### `POST /accounts/:accountId/moderators`

- **Unchanged:** owner only (add moderator by display name).

### `PATCH /accounts/:accountId/members/:memberUserId`

- **Extend:** allow **owner or moderator** caller when target row has `role = moderator`.
- **Still forbid:** toggling owner row; non-members; moderator caller targeting non-moderator rows.
- Body: `{ "isActive": boolean }`

### `DELETE /accounts/:accountId/members/:memberUserId`

- Owner only — permanently revoke moderator (per streaming-oauth-auth spec).

### Database

Add `listAccountMembers(accountId)` in `DatabaseService`:

```sql
SELECT u.id AS user_id, u.name, am.role, am.is_active
FROM account_members am
JOIN users u ON u.id = am.user_id
WHERE am.account_id = $1
ORDER BY CASE WHEN am.role = 'owner' THEN 0 ELSE 1 END, u.name
```

Add `isAccountMember(accountId, userId)` for GET auth check (active membership).

Update revoke authorization: permit if caller is owner **or** (caller is active moderator on same account **and** target is moderator role).

## Frontend

Add `fetchAccountMembers(accountId)` in `app/src/api/auth.ts` (or `accounts.ts`).

Team page loads roster on mount when `user.accountId` is set; refresh after add/revoke.
