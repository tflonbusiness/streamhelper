export const FIRST_REACTION_DRAW_LIST_DEFAULT_LIMIT = 10
export const FIRST_REACTION_DRAW_LIST_MAX_LIMIT = 50

export type FirstReactionDrawSortField =
  | 'drawIndex'
  | 'keyword'
  | 'outcome'
  | 'winner'
  | 'time'

export type FirstReactionDrawSortOrder = 'asc' | 'desc'

const DRAW_SORT_FIELDS: readonly FirstReactionDrawSortField[] = [
  'drawIndex',
  'keyword',
  'outcome',
  'winner',
  'time',
]

export function parseFirstReactionDrawListPage(
  raw: string | undefined,
): number {
  return Math.max(1, Number.parseInt(raw ?? '1', 10) || 1)
}

export function parseFirstReactionDrawListLimit(
  raw: string | undefined,
): number {
  const parsed = Number.parseInt(
    raw ?? String(FIRST_REACTION_DRAW_LIST_DEFAULT_LIMIT),
    10,
  )
  if (!Number.isFinite(parsed)) {
    return FIRST_REACTION_DRAW_LIST_DEFAULT_LIMIT
  }
  return Math.min(
    FIRST_REACTION_DRAW_LIST_MAX_LIMIT,
    Math.max(1, parsed),
  )
}

export function parseFirstReactionDrawSortField(
  raw: string | undefined,
): FirstReactionDrawSortField {
  if (
    raw &&
    (DRAW_SORT_FIELDS as readonly string[]).includes(raw)
  ) {
    return raw as FirstReactionDrawSortField
  }
  return 'time'
}

export function parseFirstReactionDrawSortOrder(
  raw: string | undefined,
): FirstReactionDrawSortOrder {
  return raw === 'asc' ? 'asc' : 'desc'
}

const OUTCOME_ORDER_SQL = `
  CASE
    WHEN phase = 'accepting' THEN 0
    WHEN phase = 'preview' THEN 1
    WHEN result = 'won' THEN 2
    WHEN result = 'expired' THEN 3
    WHEN result = 'cancelled' THEN 4
    ELSE 5
  END
`

export function buildFirstReactionDrawOrderBy(
  sortBy: FirstReactionDrawSortField,
  sortOrder: FirstReactionDrawSortOrder,
): string {
  const direction = sortOrder === 'asc' ? 'ASC' : 'DESC'
  switch (sortBy) {
    case 'drawIndex':
      return `draw_index ${direction}`
    case 'keyword':
      return `LOWER(keyword) ${direction}`
    case 'outcome':
      return `${OUTCOME_ORDER_SQL} ${direction}`
    case 'winner':
      return `LOWER(COALESCE(winner_display_name, '')) ${direction}`
    case 'time':
      return `COALESCE(closed_at, created_at) ${direction}`
    default:
      return `COALESCE(closed_at, created_at) DESC`
  }
}
