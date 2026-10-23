import type {
  GrowingJackpotRoundSortField,
  GrowingJackpotRoundSortOrder,
} from '@/api/growing-jackpot'

export const GROWING_JACKPOT_ROUND_HISTORY_PAGE_SIZE = 10

export type {
  GrowingJackpotRoundSortField,
  GrowingJackpotRoundSortOrder,
}

export type GrowingJackpotRoundSortState = {
  field: GrowingJackpotRoundSortField
  direction: GrowingJackpotRoundSortOrder
}

export const DEFAULT_GROWING_JACKPOT_ROUND_SORT: GrowingJackpotRoundSortState =
  {
    field: 'time',
    direction: 'desc',
  }

export function toGrowingJackpotRoundListParams(
  page: number,
  sort: GrowingJackpotRoundSortState,
): {
  page: number
  limit: number
  sortBy: GrowingJackpotRoundSortField
  sortOrder: GrowingJackpotRoundSortOrder
} {
  return {
    page,
    limit: GROWING_JACKPOT_ROUND_HISTORY_PAGE_SIZE,
    sortBy: sort.field,
    sortOrder: sort.direction,
  }
}
