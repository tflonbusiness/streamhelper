# Settings card — fields under explicit Save

Route: `/modules/chat-roll/:id` (`ChatRollSessionPage`). UI block: **Settings** card (`ChatRollSessionSettingsLeftPanel`).

All fields below move from **persist on change/blur** to **local draft until Save**.

| Field | Current persist trigger | Validation (unchanged) |
|-------|-------------------------|-------------------------|
| Keyword | blur | Required after trim; revert draft to server value if invalid on Save |
| Eligible roles — enable per role | toggle | At least one role may stay enabled (no new rule) |
| Eligible roles — weight per role | each change | `clampRoleWeight` (0.1–100) |
| Weight combine (`highest` / `sum`) | toggle group | — |
| Exclude winner from pool after roll | toggle | — |
| Reply in Kick chat when someone joins | toggle | — |
| Require winner chat response | toggle | — |
| Response time (seconds) | blur on number field | Integer 5–300 |

**Not in this card (stay immediate PATCH):** **Pause entries** / **Resume entries**, **Roll**, archive/header actions, participants/winners lists, Kick chat panel, widget settings dialog (already explicit Save).

**API:** `PATCH /accounts/:accountId/chat-rolls/:chatRollId` (`PatchChatRollInput`) — same fields as today; Save sends one request with all pending changes.

## UX (explicit Save flow)

| Element | Behavior |
|---------|----------|
| **Save** | Primary action in Settings section header (`SectionHeader` action); uses `common.save`; enabled only when dirty and valid enough to attempt save |
| Unsaved indicator | Visible whenever local Settings drafts ≠ last saved snapshot; hidden when clean or read-only |
| Leave confirmation | Shown on in-app navigation off `/modules/chat-roll/:id` while Settings are dirty; **Stay** / **Leave** (or equivalent i18n) |
