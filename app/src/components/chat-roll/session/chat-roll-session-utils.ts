import type { Theme } from '@mui/material/styles'
import type { ChatRollWin } from '@/api/chat-roll'
import { MODULE_CATALOG } from '@/lib/modules'

export function getChatRollWinRowBorderColor(
  win: ChatRollWin,
  theme: Theme,
): string {
  switch (win.responseStatus) {
    case 'confirmed':
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
