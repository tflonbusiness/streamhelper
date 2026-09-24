import type { PrizeSpinArchivedFilter } from '@/api/prize-spin'

export const PRIZE_SPIN_DEFAULT_TITLE = 'Prize Spin'
export const PRIZE_SPIN_HISTORY_PAGE_SIZE = 10

export function historyEmptyMessage(filter: PrizeSpinArchivedFilter): string {
  if (filter === 'true') {
    return 'No archived sessions'
  }

  return 'No prize spin sessions yet'
}
