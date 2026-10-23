import { describe, expect, it } from 'vitest';
import {
  buildGrowingJackpotRoundOrderBy,
  parseGrowingJackpotRoundSortField,
  parseGrowingJackpotRoundSortOrder,
} from './growing-jackpot-round-list.js';

describe('growing-jackpot-round-list', () => {
  it('parses sort field and order', () => {
    expect(parseGrowingJackpotRoundSortField('winner')).toBe('winner');
    expect(parseGrowingJackpotRoundSortField('bad')).toBe('time');
    expect(parseGrowingJackpotRoundSortOrder('asc')).toBe('asc');
    expect(parseGrowingJackpotRoundSortOrder('desc')).toBe('desc');
  });

  it('builds order by clauses', () => {
    expect(buildGrowingJackpotRoundOrderBy('roundIndex', 'asc')).toBe(
      'round_index ASC',
    );
    expect(buildGrowingJackpotRoundOrderBy('time', 'desc')).toContain(
      'closed_at',
    );
  });
});
