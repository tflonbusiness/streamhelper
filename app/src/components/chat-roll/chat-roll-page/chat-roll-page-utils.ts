import type { TFunction } from 'i18next'

export const CHAT_ROLL_DEFAULT_TITLE = 'Chat Roll'
export const CHAT_ROLL_HISTORY_PAGE_SIZE = 10
export const CHAT_ROLL_HISTORY_EMPTY_MESSAGE = 'No chat roll sessions yet'

export function formatChatRollLiveSessionHint(
  t: TFunction,
  isAcceptingParticipants: boolean,
): string {
  const intake = isAcceptingParticipants
    ? t('chatRoll.sessionLiveKickIntakeOpen')
    : t('chatRoll.sessionLiveKickIntakePaused')

  return `${t('chatRoll.sessionLiveStatusBase')} ${intake}`
}
