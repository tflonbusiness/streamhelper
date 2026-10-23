import type { TFunction } from 'i18next'

export const GROWING_JACKPOT_DEFAULT_TITLE = 'Growing Jackpot'
export const GROWING_JACKPOT_HISTORY_PAGE_SIZE = 10

export function formatGrowingJackpotLiveSessionHint(t: TFunction): string {
  return t('growingJackpot.historyLiveHint')
}
