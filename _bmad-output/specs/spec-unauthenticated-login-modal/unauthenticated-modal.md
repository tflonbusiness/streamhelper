# Unauthenticated login modal

## When it appears

Show the modal when **all** of the following hold:

1. The user is **not** on the login page (`/`) and **not** on public `/modules/*/widget` pages.
2. The client determines the session is invalid because any of:
   - **`ProtectedRoute`:** `useAuth()` finished loading and `user` is null while the matched route requires authentication — **show the modal instead of `<Navigate to="/" replace />`.**
   - **In-session expiry:** `fetchCurrentUser` / protected API returns **401** with parsed message **`Not authenticated`** (server `UnauthorizedException` default).

Do **not** show for 401 on public widget endpoints.

## Copy (English)

| Element | Text |
|--------|------|
| Title | Sign in required |
| Body | Your session has ended or you are not signed in. Sign in to continue using Caz Agent. |
| Primary | Go to login |
| Secondary (optional) | Cancel — closes dialog only; user remains on current URL without retrying the failed action |

## Primary action

- **Go to login** navigates to **`/`** only — plain path, **no** `?next=` or other return-url query params.
- After Kick OAuth, existing app default landing applies (typically `/dashboard`); no deep link back to the URL the user attempted before login.
- OAuth starts only from the login page (`kickLoginUrl()` / Sign in with Kick), not from the modal directly.

## Presentation

- MUI `Dialog`, `maxWidth="xs"`, `fullWidth`, same action spacing as `PrizeSpinArchiveDialog` (`StyledDialogActions` pattern).
- Modal is **modal** (`disableEscapeKeyDown` optional — prefer allowing Escape to match other dialogs).
- At most **one** instance app-wide (global provider or query cache subscriber); duplicate 401s must not stack dialogs.

## Session cleanup

When opening the modal from a 401:

- Set auth query data to `null` / invalidate `authKeys.currentUser()` so shell state matches server.

When opening from `ProtectedRoute` (no user on first load):

- Auth query already null; open the same dialog — do not redirect until **Go to login**.

Do not auto-navigate to `/` until the user clicks **Go to login**.

## ProtectedRoute behavior

Replace current `if (!user) return <Navigate to="/" replace />` with:

1. Render route outlet (or minimal shell) only if safe without user data; otherwise render nothing behind the dialog.
2. Open the global unauthenticated modal (same component as 401 path).
3. User leaves only via **Go to login** → `/` or optional **Cancel** (stays on URL, modal may re-open on next navigation attempt).

## Detection hook (implementation hint)

Centralize in one place consumed by `ProtectedRoute`, API modules, or React Query `QueryCache` / `MutationCache` `onError`:

- If `response.status === 401` and message matches `Not authenticated` (case-sensitive match to server string), invoke `showUnauthenticatedModal()`.
- Other 401 messages may keep existing error handling until explicitly scoped.
