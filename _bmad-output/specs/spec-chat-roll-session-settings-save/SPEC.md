---
id: SPEC-chat-roll-session-settings-save
companions:
  - settings-fields.md
  - ../spec-chat-roll/roll-session.md
  - ../spec-chat-roll/role-weights.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Chat Roll — explicit Save for session Settings

## Why

**Pain to solve:** On the chat roll session page (`/modules/chat-roll/:id`), every toggle and blur in **Settings** immediately PATCHes the server. Operators who adjust several options trigger multiple saves, partial failures, and no clear “commit” moment. The product ask is to batch settings persistence behind an explicit **Save** control, aligned with the widget settings dialog pattern.

**Who:** Owner or moderator editing a live chat roll session in the dashboard.

## Capabilities

- **CAP-1**
  - **intent:** An operator can change any field in the session **Settings** card without each change being sent to the server.
  - **success:** While editing, no `PATCH` runs for settings fields listed in `settings-fields.md`; network tab shows zero settings PATCHes until Save.

- **CAP-2**
  - **intent:** An operator can persist all pending **Settings** changes with one explicit **Save** action.
  - **success:** Clicking **Save** with valid drafts issues at least one `PATCH` containing the changed settings fields; after success, UI matches server state and pending edits are cleared.

- **CAP-3**
  - **intent:** An operator receives clear feedback when Save succeeds or fails.
  - **success:** Success shows a positive notification (same family as other module saves); failure shows an error message and leaves drafts intact so the operator can retry or fix validation.

- **CAP-4**
  - **intent:** An operator cannot accidentally submit an empty Save when nothing changed.
  - **success:** **Save** is disabled when there are no unsaved changes relative to the last loaded/saved server snapshot, and while a save request is in progress.

- **CAP-5**
  - **intent:** An operator who tries to leave the session page while **Settings** drafts are unsaved is warned before navigation proceeds.
  - **success:** With dirty settings, in-app navigation away from the session route shows a confirmation dialog; choosing **Stay** keeps the user on the page with drafts intact; choosing **Leave** discards unsaved settings drafts and navigation completes.

- **CAP-6**
  - **intent:** An operator can see at a glance that **Settings** have unsaved changes.
  - **success:** When drafts differ from the last saved server snapshot, a visible indicator appears in or adjacent to the **Settings** section (e.g. label, chip, or banner); it is absent when there are no unsaved changes and in read-only archived sessions.

## Constraints

- Scope is limited to the **Settings** card on `ChatRollSessionPage`; see `settings-fields.md`. **Pause entries**, **Resume entries**, **Roll**, lists, and widget settings dialog are unchanged.
- Archived (read-only) sessions: settings inputs and **Save** remain disabled; no PATCH.
- Validation rules for keyword, role weights, and winner response seconds stay as in `role-weights.md` and existing UI copy; invalid Save blocks the request and shows inline errors where applicable.
- When this ships, `roll-session.md` text “Persists on blur/change; no **Save** button” is superseded for the Settings card only.
- Navigation guard applies to leaving the chat roll **session** route while Settings are dirty; it does not block **Pause entries** / **Roll** or other immediate actions that do not navigate away.

## Non-goals

- Browser tab close / refresh warnings (`beforeunload`) unless added in a follow-up.
- Changing save UX for **Chat Roll widget** settings dialog (already explicit Save).
- New settings fields or API shape beyond existing `PatchChatRollInput`.

## Success signal

On `/modules/chat-roll/1`, an operator toggles three settings and edits the keyword, sees the unsaved indicator and enabled **Save**, sees no PATCH until **Save**, then gets success toast and a cleared indicator; with dirty settings, navigating to **Modules** shows a leave confirmation; with an empty keyword, Save stays blocked with validation and no PATCH.

## Assumptions

- Button label uses existing `common.save` (EN/RU i18n already present).
- A single Save may send one partial `PATCH` with all dirty fields; server merge semantics stay as today.
- Leave confirmation copy is added to EN/RU i18n under `chatRoll.*` (or shared `common.*` if a reusable pattern exists).
