export const GROWING_JACKPOT_ROUND_LIST_DEFAULT_LIMIT = 10;
export const GROWING_JACKPOT_ROUND_LIST_MAX_LIMIT = 50;

export type GrowingJackpotRoundSortField =
  | 'roundIndex'
  | 'keyword'
  | 'outcome'
  | 'winner'
  | 'time';

export type GrowingJackpotRoundSortOrder = 'asc' | 'desc';

const ROUND_SORT_FIELDS: readonly GrowingJackpotRoundSortField[] = [
  'roundIndex',
  'keyword',
  'outcome',
  'winner',
  'time',
];

export function parseGrowingJackpotRoundListPage(
  raw: string | undefined,
): number {
  return Math.max(1, Number.parseInt(raw ?? '1', 10) || 1);
}

export function parseGrowingJackpotRoundListLimit(
  raw: string | undefined,
): number {
  const parsed = Number.parseInt(
    raw ?? String(GROWING_JACKPOT_ROUND_LIST_DEFAULT_LIMIT),
    10,
  );
  if (!Number.isFinite(parsed)) {
    return GROWING_JACKPOT_ROUND_LIST_DEFAULT_LIMIT;
  }
  return Math.min(
    GROWING_JACKPOT_ROUND_LIST_MAX_LIMIT,
    Math.max(1, parsed),
  );
}

export function parseGrowingJackpotRoundSortField(
  raw: string | undefined,
): GrowingJackpotRoundSortField {
  if (raw && (ROUND_SORT_FIELDS as readonly string[]).includes(raw)) {
    return raw as GrowingJackpotRoundSortField;
  }
  return 'time';
}

export function parseGrowingJackpotRoundSortOrder(
  raw: string | undefined,
): GrowingJackpotRoundSortOrder {
  return raw === 'asc' ? 'asc' : 'desc';
}

const OUTCOME_ORDER_SQL = `
  CASE
    WHEN phase = 'accepting' THEN 0
    WHEN phase = 'drawing' THEN 1
    WHEN result = 'won' THEN 2
    WHEN result = 'no_participants' THEN 3
    WHEN result = 'stopped' THEN 4
    WHEN result = 'cancelled' THEN 5
    ELSE 6
  END
`;

export function buildGrowingJackpotRoundOrderBy(
  sortBy: GrowingJackpotRoundSortField,
  sortOrder: GrowingJackpotRoundSortOrder,
): string {
  const direction = sortOrder === 'asc' ? 'ASC' : 'DESC';
  switch (sortBy) {
    case 'roundIndex':
      return `round_index ${direction}`;
    case 'keyword':
      return `LOWER(join_keyword) ${direction}`;
    case 'outcome':
      return `${OUTCOME_ORDER_SQL} ${direction}`;
    case 'winner':
      return `LOWER(COALESCE(winner_display_name, '')) ${direction}`;
    case 'time':
      return `COALESCE(closed_at, created_at) ${direction}`;
    default:
      return `COALESCE(closed_at, created_at) DESC`;
  }
}
