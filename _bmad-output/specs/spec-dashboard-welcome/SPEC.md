---
id: SPEC-dashboard-welcome
companions:
  - welcome-banner.md
  - ../spec-caz-agent-ui-improvement/design-tokens.md
  - ../spec-caz-agent-ui-improvement/components.md
  - ../spec-kick-channel-dashboard/kick-channel-api.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Caz Agent — Dashboard welcome banner

## Why

**Pain:** After login, `/dashboard` opens with a generic «Главная» header and tariff/stats blocks. The operator gets no immediate confirmation of *who* they are, *which Kick stream (team account)* they entered, or *what role* they have — context that only partially appears in the sidebar `SessionContext`.

**Opportunity:** Add a personalized welcome banner at the top of dashboard home so every owner and admin instantly sees a greeting, their stream entry point, and role badge before diving into tariff and Kick stats.

**Who:** Owner and admin with `accountId` in session (Russian UI, dark shadcn).

## Capabilities

- **CAP-1**
  - **intent:** An operator sees a personalized Russian greeting on `/dashboard` home that addresses them by display name.
  - **success:** When `user.accountId` is set, a welcome card renders `Привет, {user.name}!` (or `Добро пожаловать!` if name empty) immediately from session — no extra API call.

- **CAP-2**
  - **intent:** The welcome shows which Kick stream the operator entered, with a link to the channel when slug is known.
  - **success:** Stream line follows resolution in `welcome-banner.md`: linked `kick.com/{slug}` when kick channel API returns 200; else `user.accountName`; else muted «Канал Kick не подключён».

- **CAP-3**
  - **intent:** The welcome displays the operator's role so permissions are obvious at a glance.
  - **success:** Badge shows `Владелец` for `role=owner` and `Админ` for `role=admin`, matching `SessionContext` labels, rendered from session without an extra API call.

- **CAP-4**
  - **intent:** Kick channel fetch for the stream line does not block or hide the greeting and role.
  - **success:** Greeting and role badge render on first paint; stream line shows skeleton during fetch, then resolved label or fallback per `welcome-banner.md`; kick API errors do not throw or blank the welcome card.

## Constraints

- No new backend endpoints — reuse `/auth/me` and existing `GET /accounts/:accountId/kick/channel` per `kick-channel-api.md`.
- Banner visible only on `/dashboard` **home mode** when `user.accountId` is set; hidden in picker mode.
- Page H1 remains «Главная» with existing lead; welcome is a separate section below `PageHeader`, above tariff card.
- UI: shadcn dark Russian per adopted `design-tokens.md` and `components.md`; `Card`, `Badge`, `Skeleton`.
- Live stream status, viewer count, and title stay in `KickChannelStatsSection` — not duplicated in welcome.
- Shell `SessionContext` unchanged; welcome is the home orientation surface per `welcome-banner.md`.

## Non-goals

- Editing profile name or role from the welcome banner.
- Live «В эфире» badge, viewer count, or stream title inline in welcome — live state lives only in `KickChannelStatsSection`.
- Welcome on `/team`, `/modules`, or other routes.
- Replacing or removing sidebar `SessionContext`.
- Team picker / multi-account switch UI (out of scope per oauth spec).

## Success signal

Owner logs in via Kick OAuth → `/dashboard` shows «Привет, {name}!», role badge «Владелец», and linked `kick.com/{slug}` in the welcome card above tariff → admin joins via access link → same banner with «Админ» and the owner's stream slug → kick channel 404 shows `accountName` or «Канал Kick не подключён» while greeting and role still render → `npm run build` in `app/` passes.

## Assumptions

- «Стрим» in the user request means the connected Kick channel (slug), not the current broadcast title.
- `accountName` from session usually matches Kick username; API slug is preferred when channel is connected.
- Brief role badge overlap with shell on home is acceptable; shell stays the compact nav meta.
