import type { Theme } from '@mui/material/styles'
import type { ChatRollWin, ChatRollWinResponseStatus } from '@/api/chat-roll'
import { MODULE_CATALOG } from '@/lib/modules'

export type ChatRollWinSectionKey = 'confirmed' | 'pending' | 'no_response'

export const CHAT_ROLL_WIN_SECTION_ORDER: ChatRollWinSectionKey[] = [
  'pending',
  'confirmed',
  'no_response',
]

export function getChatRollWinSectionKey(
  status: ChatRollWinResponseStatus,
): ChatRollWinSectionKey {
  if (status === 'pending') {
    return 'pending'
  }
  if (status === 'no_response') {
    return 'no_response'
  }
  return 'confirmed'
}

export function sortChatRollWinsForDisplay(wins: ChatRollWin[]): ChatRollWin[] {
  return [...wins].sort((a, b) => {
    const aSection = CHAT_ROLL_WIN_SECTION_ORDER.indexOf(
      getChatRollWinSectionKey(a.responseStatus),
    )
    const bSection = CHAT_ROLL_WIN_SECTION_ORDER.indexOf(
      getChatRollWinSectionKey(b.responseStatus),
    )
    if (aSection !== bSection) {
      return aSection - bSection
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function getChatRollWinRowBorderColor(
  win: ChatRollWin,
  theme: Theme,
): string {
  switch (win.responseStatus) {
    case 'confirmed':
    case 'not_required':
      return theme.palette.success.main
    case 'no_response':
      return theme.palette.error.main
    case 'pending':
      return theme.palette.warning.main
    default:
      return theme.palette.divider
  }
}

export const chatRollModule = MODULE_CATALOG.find(
  (module) => module.id === 'chat-roll',
)!
