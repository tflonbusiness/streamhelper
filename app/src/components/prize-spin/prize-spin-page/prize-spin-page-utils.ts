import type { PrizeSpinArchivedFilter } from '@/api/prize-spin'

export const PRIZE_SPIN_DEFAULT_TITLE = 'Prize Spin'
export const PRIZE_SPIN_HISTORY_PAGE_SIZE = 10
const PRIZE_SPIN_TITLE_MAX_LENGTH = 200
const PRIZE_SPIN_COPY_TITLE_SUFFIX = ' (copy)'

export function defaultCopyPrizeSpinTitle(sourceTitle: string): string {
  const combined = `${sourceTitle}${PRIZE_SPIN_COPY_TITLE_SUFFIX}`
  if (combined.length <= PRIZE_SPIN_TITLE_MAX_LENGTH) {
    return combined
  }

  return (
    sourceTitle.slice(
      0,
      PRIZE_SPIN_TITLE_MAX_LENGTH - PRIZE_SPIN_COPY_TITLE_SUFFIX.length,
    ) + PRIZE_SPIN_COPY_TITLE_SUFFIX
  )
}

export function historyEmptyMessage(filter: PrizeSpinArchivedFilter): string {
  if (filter === 'true') {
    return 'No archived sessions'
  }

  return 'No prize spin sessions yet'
}
