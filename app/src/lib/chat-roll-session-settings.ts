import type {
  ChatRollRecord,
  ChatRollRoleSettings,
  PatchChatRollInput,
} from '@/api/chat-roll'
import type { ChatRollRoleId } from '@/lib/chat-roll'
import { clampRoleWeight } from '@/lib/chat-roll'

export type ChatRollSessionSettingsDraft = {
  keyword: string
  combineMode: ChatRollRecord['combineMode']
  excludeWinnerAfterRoll: boolean
  replyInChat: boolean
  winnerResponseEnabled: boolean
  winnerResponseSeconds: number | ''
  roleSettings: ChatRollRoleSettings
}

function cloneRoleSettings(
  roleSettings: ChatRollRoleSettings,
): ChatRollRoleSettings {
  return Object.fromEntries(
    Object.entries(roleSettings).map(([roleId, setting]) => [
      roleId,
      { ...setting },
    ]),
  ) as ChatRollRoleSettings
}

export function chatRollSettingsDraftFromRecord(
  record: ChatRollRecord,
): ChatRollSessionSettingsDraft {
  return {
    keyword: record.keyword,
    combineMode: record.combineMode,
    excludeWinnerAfterRoll: record.excludeWinnerAfterRoll,
    replyInChat: record.replyInChat,
    winnerResponseEnabled: record.winnerResponseEnabled,
    winnerResponseSeconds: record.winnerResponseSeconds,
    roleSettings: cloneRoleSettings(record.roleSettings),
  }
}

export function areChatRollSettingsDraftsEqual(
  a: ChatRollSessionSettingsDraft,
  b: ChatRollSessionSettingsDraft,
): boolean {
  if (a.keyword !== b.keyword) return false
  if (a.combineMode !== b.combineMode) return false
  if (a.excludeWinnerAfterRoll !== b.excludeWinnerAfterRoll) return false
  if (a.replyInChat !== b.replyInChat) return false
  if (a.winnerResponseEnabled !== b.winnerResponseEnabled) return false
  if (a.winnerResponseSeconds !== b.winnerResponseSeconds) return false

  for (const roleId of Object.keys(a.roleSettings) as ChatRollRoleId[]) {
    const left = a.roleSettings[roleId]
    const right = b.roleSettings[roleId]
    if (left.enabled !== right.enabled || left.weight !== right.weight) {
      return false
    }
  }

  return true
}

export function isChatRollSettingsDraftDirty(
  record: ChatRollRecord,
  draft: ChatRollSessionSettingsDraft,
): boolean {
  return !areChatRollSettingsDraftsEqual(
    draft,
    chatRollSettingsDraftFromRecord(record),
  )
}

export function validateChatRollSettingsDraftKeyword(
  draft: ChatRollSessionSettingsDraft,
): boolean {
  return draft.keyword.trim().length > 0
}

export const WINNER_RESPONSE_SECONDS_MIN = 10
export const WINNER_RESPONSE_SECONDS_MAX = 300
export const WINNER_RESPONSE_SECONDS_DEFAULT = 25

export function isWinnerResponseSecondsInRange(seconds: number): boolean {
  return (
    Number.isFinite(seconds) &&
    seconds >= WINNER_RESPONSE_SECONDS_MIN &&
    seconds <= WINNER_RESPONSE_SECONDS_MAX
  )
}

export function parseWinnerResponseSecondsDraftInput(
  raw: string,
): number | '' {
  if (raw === '') {
    return ''
  }
  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed)) {
    return ''
  }
  return parsed
}

export function isWinnerResponseSecondsDraftValueValid(
  value: number | '',
): boolean {
  return typeof value === 'number' && isWinnerResponseSecondsInRange(value)
}

export function validateChatRollSettingsDraftWinnerResponseSeconds(
  draft: ChatRollSessionSettingsDraft,
): boolean {
  if (!draft.winnerResponseEnabled) {
    return true
  }
  return isWinnerResponseSecondsDraftValueValid(draft.winnerResponseSeconds)
}

export function buildChatRollSettingsPatch(
  record: ChatRollRecord,
  draft: ChatRollSessionSettingsDraft,
): PatchChatRollInput {
  const body: PatchChatRollInput = {}
  const trimmedKeyword = draft.keyword.trim()

  if (trimmedKeyword !== record.keyword) {
    body.keyword = trimmedKeyword
  }
  if (draft.combineMode !== record.combineMode) {
    body.combine_mode = draft.combineMode
  }
  if (draft.excludeWinnerAfterRoll !== record.excludeWinnerAfterRoll) {
    body.exclude_winner_after_roll = draft.excludeWinnerAfterRoll
  }
  if (draft.replyInChat !== record.replyInChat) {
    body.reply_in_chat = draft.replyInChat
  }
  if (draft.winnerResponseEnabled !== record.winnerResponseEnabled) {
    body.winner_response_enabled = draft.winnerResponseEnabled
  }
  if (
    draft.winnerResponseSeconds !== record.winnerResponseSeconds &&
    typeof draft.winnerResponseSeconds === 'number' &&
    isWinnerResponseSecondsInRange(draft.winnerResponseSeconds)
  ) {
    body.winner_response_seconds = draft.winnerResponseSeconds
  }

  const roleSettingsChanged = (
    Object.keys(draft.roleSettings) as ChatRollRoleId[]
  ).some((roleId) => {
    const draftRole = draft.roleSettings[roleId]
    const recordRole = record.roleSettings[roleId]
    return (
      draftRole.enabled !== recordRole.enabled ||
      draftRole.weight !== recordRole.weight
    )
  })

  if (roleSettingsChanged) {
    body.role_settings = cloneRoleSettings(draft.roleSettings)
  }

  return body
}

export function clampRoleWeightInDraft(
  draft: ChatRollSessionSettingsDraft,
  roleId: ChatRollRoleId,
  raw: string,
): ChatRollSessionSettingsDraft {
  const parsed = Number.parseFloat(raw)
  return {
    ...draft,
    roleSettings: {
      ...draft.roleSettings,
      [roleId]: {
        ...draft.roleSettings[roleId],
        weight: clampRoleWeight(parsed),
      },
    },
  }
}
