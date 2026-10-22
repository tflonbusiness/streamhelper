import type {
  FirstReactionDrawSortField,
  FirstReactionDrawSortOrder,
} from '@/api/first-reaction'

export const FIRST_REACTION_DRAW_HISTORY_PAGE_SIZE = 10

export type {
  FirstReactionDrawSortField,
  FirstReactionDrawSortOrder,
}

export type FirstReactionDrawSortState = {
  field: FirstReactionDrawSortField
  direction: FirstReactionDrawSortOrder
}

export const DEFAULT_FIRST_REACTION_DRAW_SORT: FirstReactionDrawSortState = {
  field: 'time',
  direction: 'desc',
}

export function toFirstReactionDrawListParams(
  page: number,
  sort: FirstReactionDrawSortState,
): {
  page: number
  limit: number
  sortBy: FirstReactionDrawSortField
  sortOrder: FirstReactionDrawSortOrder
} {
  return {
    page,
    limit: FIRST_REACTION_DRAW_HISTORY_PAGE_SIZE,
    sortBy: sort.field,
    sortOrder: sort.direction,
  }
}
