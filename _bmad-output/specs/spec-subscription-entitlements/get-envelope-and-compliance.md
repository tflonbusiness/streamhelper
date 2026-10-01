# GET envelope, compliance, widgets

## Module GET envelope (phase 1)

Attach to account-scoped **module list** and **session detail** GET responses used by app pages (Bonus Buy, Prize Spin, Chat Roll, Team where applicable):

```json
{
  "entitlements": {
    "planTier": "trial",
    "limits": {
      "sessionsPerModule": 2,
      "prizeSpinSectorsPerSession": 10,
      "bonusBuySlotsPerSession": 20,
      "adminMembers": 1
    }
  },
  "usage": {
    "sessions": { "bonusBuy": 1, "prizeSpin": 2, "chatRoll": 0 },
    "prizeSpinSectors": 12,
    "bonusBuySlots": 8,
    "adminMembers": 1
  },
  "compliance": "over_limit"
}
```

- **`limits`**: use `null` for unlimited dimensions on `max`.
- **`compliance`**: `ok` | `over_limit` — account-level for session page; include session-scoped usage where needed (e.g. sector count for current prize spin).
- **`/auth/me`**: may expose `planTier`, `hasAccess`, `endsAt` only; full block lives on module GET (not login-only).

## UI behavior

| State | UI |
| --- | --- |
| At numeric cap (usage === limit) | Disable create/add/copy that would increase usage |
| `compliance === over_limit` | Block interactions except delete/archive; show warning to remove excess |
| After successful delete/archive | **Refetch same session GET**; re-enable when `compliance === ok` (no full page reload) |

## Public OBS widgets

After existing `hasAccess` check on public widget GET:

| Condition | Response |
| --- | --- |
| `!hasAccess` | `{ status: "unavailable", reason: "subscription_expired" }` (existing) |
| `over_limit` | `{ status: "unavailable", reason: "entitlement_over_limit" }` |
| else | existing `active` payload |

- Same compliance helper as module session GET.
- Add `entitlement_over_limit` to `PublicWidgetUnavailableReason` and widget i18n copy.
- Recovery: next widget poll/refetch after user fixes data in app — no OBS browser reload.

## Admin (team member) when subscription inactive

On dashboard when `role === 'admin'` and `!hasAccess`: banner «Подписка команды не активна — свяжитесь с владельцем аккаунта».

## Phase 2 (out of this spec)

- INSERT/POST `assertEntitlement` on server
- Hard `ENTITLEMENT_OVER_LIMIT` on go-live, spin, kick intake POST
