import type {
  ChatRollRecord,
  PatchChatRollInput,
} from '@/api/chat-roll'
import type { ChatRollRoleId } from '@/lib/chat-roll'
import type { ChatRollRoleSettings } from '@/api/chat-roll'
import type { TFunction } from 'i18next'

export type ChatRollRoleSettingDraft = {
  enabled: boolean
  weight: number | ''
}

export type ChatRollRoleSettingsDraft = Record<
  ChatRollRoleId,
  ChatRollRoleSettingDraft
>

export type ChatRollSessionSettingsDraft = {
  keyword: string
  widgetKeywordPrefix: string
  combineMode: ChatRollRecord['combineMode']
  excludeWinnerAfterRoll: boolean
  replyInChat: boolean
  winnerResponseEnabled: boolean
  winnerResponseSeconds: number | ''
  showWinnerResponseInReveal: boolean
  roleSettings: ChatRollRoleSettingsDraft
}

function cloneRoleSettingsFromRecord(
  roleSettings: ChatRollRoleSettings,
): ChatRollRoleSettingsDraft {
  return Object.fromEntries(
    Object.entries(roleSettings).map(([roleId, setting]) => [
      roleId,
      { enabled: setting.enabled, weight: setting.weight },
    ]),
  ) as ChatRollRoleSettingsDraft
}

function serializeRoleSettingsDraft(
  roleSettings: ChatRollRoleSettingsDraft,
): ChatRollRoleSettings {
  return Object.fromEntries(
    Object.entries(roleSettings).map(([roleId, setting]) => [
      roleId,
      {
        enabled: setting.enabled,
        weight: typeof setting.weight === 'number' ? setting.weight : 0.1,
      },
    ]),
  ) as ChatRollRoleSettings
}

export function chatRollSettingsDraftFromRecord(
  record: ChatRollRecord,
): ChatRollSessionSettingsDraft {
  return {
    keyword: record.keyword,
    widgetKeywordPrefix: record.widgetKeywordPrefix,
    combineMode: record.combineMode,
    excludeWinnerAfterRoll: record.excludeWinnerAfterRoll,
    replyInChat: record.replyInChat,
    winnerResponseEnabled: record.winnerResponseEnabled,
    winnerResponseSeconds: record.winnerResponseSeconds,
    showWinnerResponseInReveal: record.showWinnerResponseInReveal,
    roleSettings: cloneRoleSettingsFromRecord(record.roleSettings),
  }
}

export function areChatRollSettingsDraftsEqual(
  a: ChatRollSessionSettingsDraft,
  b: ChatRollSessionSettingsDraft,
): boolean {
  if (a.keyword !== b.keyword) return false
  if (a.widgetKeywordPrefix !== b.widgetKeywordPrefix) return false
  if (a.combineMode !== b.combineMode) return false
  if (a.excludeWinnerAfterRoll !== b.excludeWinnerAfterRoll) return false
  if (a.replyInChat !== b.replyInChat) return false
  if (a.winnerResponseEnabled !== b.winnerResponseEnabled) return false
  if (a.winnerResponseSeconds !== b.winnerResponseSeconds) return false
  if (a.showWinnerResponseInReveal !== b.showWinnerResponseInReveal) return false

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

export const WIDGET_KEYWORD_PREFIX_MAX_LENGTH = 120

export function validateChatRollSettingsDraftWidgetKeywordPrefix(
  draft: ChatRollSessionSettingsDraft,
): boolean {
  const trimmed = draft.widgetKeywordPrefix.trim()
  return trimmed.length > 0 && trimmed.length <= WIDGET_KEYWORD_PREFIX_MAX_LENGTH
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

export const ROLE_WEIGHT_MIN = 0.1
export const ROLE_WEIGHT_MAX = 100

export function isRoleWeightInRange(weight: number): boolean {
  return (
    Number.isFinite(weight) &&
    weight >= ROLE_WEIGHT_MIN &&
    weight <= ROLE_WEIGHT_MAX
  )
}

export function parseRoleWeightDraftInput(raw: string): number | '' {
  if (raw === '') {
    return ''
  }
  const parsed = Number.parseFloat(raw)
  if (!Number.isFinite(parsed)) {
    return ''
  }
  return parsed
}

export function isRoleWeightDraftValueValid(value: number | ''): boolean {
  return typeof value === 'number' && isRoleWeightInRange(value)
}

export function validateChatRollSettingsDraftRoleWeights(
  draft: ChatRollSessionSettingsDraft,
): boolean {
  for (const roleId of Object.keys(draft.roleSettings) as ChatRollRoleId[]) {
    const setting = draft.roleSettings[roleId]
    if (!setting.enabled) {
      continue
    }
    if (!isRoleWeightDraftValueValid(setting.weight)) {
      return false
    }
  }
  return true
}

export function getChatRollRoleWeightFieldError(
  draft: ChatRollSessionSettingsDraft,
  roleId: ChatRollRoleId,
  t: TFunction,
): string | null {
  const setting = draft.roleSettings[roleId]
  if (!setting.enabled) {
    return null
  }
  if (isRoleWeightDraftValueValid(setting.weight)) {
    return null
  }
  if (setting.weight === '') {
    return t('chatRoll.roleWeightRequired')
  }
  return t('chatRoll.roleWeightOutOfRange')
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
  if (
    draft.showWinnerResponseInReveal !== record.showWinnerResponseInReveal
  ) {
    body.show_winner_response_in_reveal = draft.showWinnerResponseInReveal
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

  if (roleSettingsChanged && validateChatRollSettingsDraftRoleWeights(draft)) {
    body.role_settings = serializeRoleSettingsDraft(draft.roleSettings)
  }

  return body
}

export function updateRoleWeightInDraft(
  draft: ChatRollSessionSettingsDraft,
  roleId: ChatRollRoleId,
  raw: string,
): ChatRollSessionSettingsDraft {
  return {
    ...draft,
    roleSettings: {
      ...draft.roleSettings,
      [roleId]: {
        ...draft.roleSettings[roleId],
        weight: parseRoleWeightDraftInput(raw),
      },
    },
  }
}
