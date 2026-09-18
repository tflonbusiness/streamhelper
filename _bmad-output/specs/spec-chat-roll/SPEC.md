---
id: SPEC-chat-roll
companions:
  - chat-roll-module.md
  - roll-session.md
  - role-weights.md
  - mock-data.md
  - database-schema.md
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
  - **intent:** An operator opens the Chat Roll workspace from the module card.
  - **success:** Route renders inside `AppShell` with `PageHeader` and page layout per `roll-session.md`.

- **CAP-3**
  - **intent:** An operator sets the collection keyword in a **Settings** section.
  - **success:** **Keyword** field visible in Settings card; default `!roll`; accepts any non-empty trimmed string; invalid empty value shows inline validation.

- **CAP-4**
  - **intent:** An operator enables viewer role categories, sets a per-role weight, and chooses how multiple matching roles combine.
  - **success:** Five role toggles per `role-weights.md`; enabled roles show **Weight** input; **Weight combine** radio offers **Highest** and **Sum**; **Exclude winner from pool after roll** toggle; settings persist per session.

- **CAP-5**
  - **intent:** An operator sees **Participants** and **Winners** as two side-by-side columns listing display names; each participant row shows their computed win coefficient.
  - **success:** Two-column grid per `roll-session.md`; participant rows show name, optional role chips, and coefficient chip; winners show names only.

- **CAP-6**
  - **intent:** An operator clears the full **Participants** list or removes a single participant.
  - **success:** **Clear all** archives all active participants (`is_archived = true`); per-row delete archives one entry.

- **CAP-7**
  - **intent:** An operator clears the full **Winners** list or removes a single winner.
  - **success:** **Clear all** archives all active win rows (`is_archived = true`); per-row delete archives one win row; rows are retained in DB.

- **CAP-8**
  - **intent:** An operator creates and manages **chat_roll** sessions per account with `live` / `off_air` / `archived` status lifecycle matching Prize Spin.
  - **success:** At most one `live` session per account; session list ordered by `created_at DESC`; archived sessions excluded from default list.

- **CAP-9**
  - **intent:** Roll settings persist on the **chat_roll** session row and survive refresh.
  - **success:** `keyword`, `combine_mode`, `exclude_winner_after_roll`, and `role_settings` JSONB match operator edits after reload; new session copies from most recent non-archived session.

- **CAP-10**
  - **intent:** Participants and winners persist in child tables per session.
  - **success:** `chat_roll_participant` holds entrants with `provider` + `provider_user_id` and `role_ids`; coefficient is computed live from session settings; `chat_roll_win` links to winner via `participant_id` FK with `coefficient_at_pick` and `is_archived` per `database-schema.md`.

- **CAP-11**
  - **intent:** An operator configures **chat_roll_widget** overlay dimensions per account.
  - **success:** One row per account with `width` and `height` (200–2400 px); bootstrap on account provision; PATCH updates `updated_at`.

- **CAP-12**
  - **intent:** An operator pauses or resumes accepting new participants without ending the session.
  - **success:** **Pause entries** / **Resume entries** control toggles `is_accepting_participants` on `chat_roll`; when paused, no new participants are added (chat intake or manual); existing pool and **Roll** stay available; state persists and survives refresh.

## Constraints

- **English UI** on all labels, buttons, role names, and empty states per adopted `spec-app-english-only`.
- **Prize Spin parity** — `chat_roll` + `chat_roll_widget` follow `prize_spin` / `prize_spin_widget` column patterns and status lifecycle.
- **Session snapshot settings** — `role_settings` JSONB on `chat_roll` holds all five role keys; validated server-side.
- **Live coefficient** — participant coefficient is derived at read/pick from `role_ids` + session `role_settings` + `combine_mode`; not stored on `chat_roll_participant`. Win rows store `coefficient_at_pick` only.
- **Platform identity** — `chat_roll_participant.provider_user_id` is the external platform viewer id (not `users.id`); `provider` is `kick` \| `twitch` \| `youtube`.
- **Dedup** — one active participant per `(provider, provider_user_id)` per session when both are present.
- **Archive pattern** — `is_archived` on `chat_roll_participant` and `chat_roll_win` (same as `prize_spin_win`, `bonus_buy_slot`).
- **Entry gate** — when `is_accepting_participants` is `false`, server rejects all new `chat_roll_participant` inserts with `ENTRIES_PAUSED`.
- **Fixed role catalog** — exactly five categories in `role-weights.md`.
- **Weight inputs** — `0.1`–`100`, one decimal place.
- **MUI patterns** — consistent with Bonus Buy and Prize Spin pages.
- **Standalone module** — `/chat-roll` route.

## Non-goals

- Kick chat intake, OAuth channel binding, or real-time message processing (schema reserves `provider` + `provider_user_id`).
- Collection timer (auto-pause after N minutes).
- OBS overlay public read endpoint (widget table only in this slice).
- Bot winner announcement in Kick chat.
- Per-row role editing on live participants (roles are snapshot at join).
- Separate account-level defaults table (copy-from-last-session instead).

## Success signal

An operator creates a chat roll session, sets keyword `!join` with **Sum** combine mode, adds participants, clicks **Roll**, sees the winner in **Winners** and optionally removed from **Participants**, refreshes the page, and finds session settings, participant list, and win history restored from `chat_roll`, `chat_roll_participant`, and `chat_roll_win` tables.

## Assumptions

- Module card and route from CAP-1/CAP-2 are shipped.
- New session inherits settings from the account's most recent non-archived session.
- API layer consuming these tables is a follow-on slice; UI may still use localStorage until wired.
- `chat_roll_widget` defaults to 500×500 px like Prize Spin.

## Open Questions

- Should archived sessions expose full read-only participant/win lists in history UI, or only metadata (title, keyword, winner count)?
