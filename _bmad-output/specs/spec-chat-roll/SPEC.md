---
id: SPEC-chat-roll
companions:
  - ARCHITECTURE-SPINE.md
  - chat-roll-module.md
  - roll-session.md
  - role-weights.md
  - mock-data.md
  - database-schema.md
  - ../spec-kick-chat-bot/SPEC.md
  - ../spec-app-english-only/SPEC.md
  - ../spec-caz-agent-ui-improvement/design-tokens.md
  - ../spec-caz-agent-ui-improvement/components.md
  - ../spec-caz-team-dashboard/modules-catalog.md
  - ../spec-caz-team-dashboard/nav-shell.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Caz Agent — Chat Roll module

## Why

**Opportunity:** Streamers run weighted chat giveaways — viewers type a keyword, operators pick winners with boosted odds for VIPs, mods, and subs. Chat Roll needs a dashboard workspace **and** server persistence so sessions, participants, and winners survive refresh and can go live on stream overlays. This spec covers the UI workspace (mock → API), roll mechanics, and **database tables** modeled after Prize Spin.

**Who:** Owner or moderator on an active Caz Agent account (English UI, existing dark MUI theme).

## Capabilities

- **CAP-1**
  - **intent:** An operator sees a **Chat Roll** module card on `/modules` in the existing responsive grid.
  - **success:** Card renders with name **Chat Roll**, description from `chat-roll-module.md`, **Available** badge, and **Open** navigates to `/chat-roll`.

- **CAP-2**
  - **intent:** An operator opens a chat roll session workspace at `/modules/chat-roll/:id`.
  - **success:** Route renders inside `AppShell` with `PageHeader`, session header card, and main layout per `roll-session.md`; invalid id shows error state.

- **CAP-13**
  - **intent:** An operator configures roll settings and reviews participants and winners in a two-column session layout on desktop.
  - **success:** At `lg+`, **Settings** card and **Roll** / **Pause entries** action bar occupy the **left** column (`Grid` ~5/12); **Participants** and **Winners** list cards occupy the **right** column (~7/12) side by side; below `lg`, zones stack vertically in order settings → actions → participants → winners; behavior of fields and lists unchanged from CAP-3–7 and CAP-12.

- **CAP-3**
  - **intent:** An operator sets the collection keyword in the **Settings** section on the left column of the session workspace.
  - **success:** **Keyword** field visible in Settings card (left column per CAP-13); default `!roll`; accepts any non-empty trimmed string; invalid empty value shows inline validation.

- **CAP-4**
  - **intent:** An operator enables viewer role categories, sets a per-role weight, and chooses how multiple matching roles combine.
  - **success:** Five role toggles per `role-weights.md`; enabled roles show **Weight** input; **Weight combine** radio offers **Highest** and **Sum**; **Exclude winner from pool after roll** toggle; settings persist per session.

- **CAP-5**
  - **intent:** An operator sees **Participants** and **Winners** as two side-by-side list cards listing display names; each participant row shows their computed win coefficient.
  - **success:** Both lists live in the **right** workspace column per `roll-session.md` (side by side within that column on `md+`); participant rows show name, optional role chips, and coefficient chip; winners show names only.

- **CAP-6**
  - **intent:** An operator clears the full **Participants** list or removes a single participant.
  - **success:** **Clear all** archives all active participants (`is_archived = true`); per-row delete archives one entry; operator UI and session `GET` list endpoints return only rows with `is_archived = false` — archived participants never appear in the table.

- **CAP-7**
  - **intent:** An operator clears the full **Winners** list or removes a single winner.
  - **success:** **Clear all** archives all active win rows (`is_archived = true`); per-row delete archives one win row; rows are retained in DB; operator UI and session `GET` list endpoints return only rows with `is_archived = false` — archived wins never appear in the table.

- **CAP-8**
  - **intent:** An operator creates and manages **chat_roll** sessions per account with `live` / `off_air` / `archived` status lifecycle matching Prize Spin.
  - **success:** At most one `live` session per account; history on `/modules/chat-roll` lists only non-archived sessions (`status` `live` or `off_air`); `status = archived` sessions are omitted from history; archive moves a session off the history table; direct URL to archived session id may still load read-only workspace.

- **CAP-9**
  - **intent:** Roll settings persist on the **chat_roll** session row and survive refresh.
  - **success:** `keyword`, `combine_mode`, `exclude_winner_after_roll`, `winner_response_enabled`, `winner_response_seconds`, and `role_settings` JSONB match operator edits after reload; new session copies from most recent non-archived session.

- **CAP-10**
  - **intent:** Participants and winners persist in child tables per session.
  - **success:** `chat_roll_participant` holds entrants with `provider` + `provider_user_id` and `role_ids`; coefficient is computed live from session settings; `chat_roll_win` links to winner via `participant_id` FK with `coefficient_at_pick` and `is_archived` per `database-schema.md`.

- **CAP-11**
  - **intent:** An operator configures **chat_roll_widget** overlay dimensions per account.
  - **success:** One row per account with `width` and `height` (200–2400 px); bootstrap on account provision; PATCH updates `updated_at`.

- **CAP-12**
  - **intent:** An operator pauses or resumes accepting new participants without ending the session.
  - **success:** **Pause entries** / **Resume entries** control toggles `is_accepting_participants` on `chat_roll`; when paused, no new participants are added (chat intake only); existing pool and **Roll** stay available; state persists and survives refresh.

- **CAP-14**
  - **intent:** While a session is **live**, the operator sees chat keyword intake reflected in **Participants** without manually refreshing the page.
  - **success:** Session data refetches on a fixed interval (~5s) when `status = 'live'`; polling stops for `off_air` and `archived`; new Kick keyword joins appear in the list within one poll cycle after server insert.

- **CAP-15**
  - **intent:** A viewer removed from **Participants** may re-enter the pool by sending the session keyword again.
  - **success:** Archiving a participant clears active dedup; a subsequent successful keyword intake creates a new non-archived `chat_roll_participant` row; repeat keyword while still active remains deduped with no duplicate bot join reply.

- **CAP-16**
  - **intent:** After each **Roll**, the platform optionally requires the picked winner to send a chat message within a configured time window to mark the win as confirmed.
  - **success:** When `winner_response_enabled` is true, each new `chat_roll_win` starts in `response_status = pending` with `response_deadline_at = created_at + winner_response_seconds`; any non-empty Kick chat message from the winner’s `provider_user_id` before the deadline sets `confirmed` and `responded_at`; after deadline, lazy expiry sets `no_response`; when disabled, new wins use `not_required` with null deadlines.

- **CAP-17**
  - **intent:** An operator may run multiple **Roll** actions without waiting for prior winners to confirm in chat.
  - **success:** **Roll** is not blocked by wins in `pending`; multiple pending wins may coexist; one qualifying chat message confirms only the oldest pending win for that sender (FIFO); UI shows per-win status chip and remaining time for `pending` rows.

## Constraints

- **English UI** on all labels, buttons, role names, and empty states per adopted `spec-app-english-only`.
- **Prize Spin parity** — `chat_roll` + `chat_roll_widget` follow `prize_spin` / `prize_spin_widget` column patterns and status lifecycle.
- **Session snapshot settings** — `role_settings` JSONB on `chat_roll` holds all five role keys; validated server-side.
- **Live coefficient** — participant coefficient is derived at read/pick from `role_ids` + session `role_settings` + `combine_mode`; not stored on `chat_roll_participant`. Win rows store `coefficient_at_pick` only.
- **Platform identity** — `chat_roll_participant.provider_user_id` is the external platform viewer id (not `users.id`); `provider` is `kick` \| `twitch` \| `youtube`.
- **Dedup** — one active participant per `(provider, provider_user_id)` per session when both are present; re-entry after operator archive is allowed per CAP-15.
- **Live dashboard sync** — HTTP polling only while session is `live`; no Pusher/SSE in this slice (`ARCHITECTURE-SPINE.md` AD-5).
- **Chat persistence** — no full chat log and no operator add-from-chat; intake and winner-response matching use webhooks in process, not stored message history (`ARCHITECTURE-SPINE.md` AD-6).
- **Winner response** — per-win status lifecycle; Roll never blocked by pending responses (`ARCHITECTURE-SPINE.md` AD-8).
- **Archive pattern** — `is_archived` on `chat_roll_participant` and `chat_roll_win` (same as `prize_spin_win`, `bonus_buy_slot`).
- **Entry gate** — when `is_accepting_participants` is `false`, server rejects all new `chat_roll_participant` inserts with `ENTRIES_PAUSED`.
- **Fixed role catalog** — exactly five categories in `role-weights.md`.
- **Weight inputs** — `0.1`–`100`, one decimal place.
- **MUI patterns** — consistent with Bonus Buy and Prize Spin pages.
- **Module routes** — history `/modules/chat-roll`, session `/modules/chat-roll/:id`; use `app/src/lib/routes.ts` helpers.
- **Session page layout** — `lg+` two columns: left = settings + roll action bar; right = participants + winners (`roll-session.md`); supersedes full-width settings above full-width lists.
- **Non-archived lists only** — `listChatRollParticipants` and `listChatRollWins` SQL filter `is_archived = false`; UI never renders archived participant or win rows.
- **History sessions** — `GET /accounts/:accountId/chat-rolls` uses `archived=false` only from history UI; no **Show** filter for Archived or All.

## Non-goals

- Operator manual add-from-chat or recent-chat picker UI.
- Pusher, SSE, or WebSocket transport for the operator dashboard.
- Storing full Kick chat history for browsing.
- Auto re-roll when a winner is marked `no_response`.
- Collection timer (auto-pause after N minutes).
- OBS overlay public read endpoint (widget table only in this slice).
- Bot winner announcement in Kick chat.
- Per-row role editing on live participants (roles are snapshot at join).
- Separate account-level defaults table (copy-from-last-session instead).
- Browsing archived sessions from history table or filter — history shows active sessions only.
- Operator UI audit views for archived `chat_roll_participant` / `chat_roll_win` rows.

## Success signal

An operator creates a chat roll session, sets keyword `!join` with **Sum** combine mode, adds participants, clicks **Roll**, sees the winner in **Winners** and optionally removed from **Participants**, refreshes the page, and finds session settings, participant list, and win history restored from `chat_roll`, `chat_roll_participant`, and `chat_roll_win` tables.

## Assumptions

- Module card and route from CAP-1/CAP-2 are shipped.
- New session inherits settings from the account's most recent non-archived session.
- API layer consuming these tables is a follow-on slice; UI may still use localStorage until wired.
- `chat_roll_widget` defaults to 500×500 px like Prize Spin.
- Archived participant and win rows remain in DB for audit but are excluded from all operator-facing lists.
- Archiving a session removes it from `/modules/chat-roll` history; opening an archived session by URL shows read-only workspace with non-archived participant/win rows only (if any).
