import { alpha, type Theme } from '@mui/material/styles'
import type { PrizeSpinArchivedFilter } from '@/api/prize-spin'

export const PRIZE_SPIN_DEFAULT_TITLE = 'Prize Spin'
export const PRIZE_SPIN_HISTORY_PAGE_SIZE = 10

export function historyEmptyMessage(filter: PrizeSpinArchivedFilter): string {
  if (filter === 'true') {
    return 'No archived sessions'
  }

  return 'No prize spin sessions yet'
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
