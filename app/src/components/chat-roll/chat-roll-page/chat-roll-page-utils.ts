import { alpha, type Theme } from '@mui/material/styles'
import type { ChatRollArchivedFilter } from '@/api/chat-roll'

export const CHAT_ROLL_DEFAULT_TITLE = 'Chat Roll'
export const CHAT_ROLL_HISTORY_PAGE_SIZE = 10

export function historyEmptyMessage(filter: ChatRollArchivedFilter): string {
  if (filter === 'true') {
    return 'No archived sessions'
  }

  return 'No chat roll sessions yet'
}

export function liveSessionRowSx(theme: Theme) {
  return {
    bgcolor: alpha(theme.palette.warning.main, 0.08),
    boxShadow: `inset 0 0 0 2px ${alpha(theme.palette.warning.main, 0.55)}`,
    '&:hover': {
      bgcolor: alpha(theme.palette.warning.main, 0.12),
    },
  }
}
