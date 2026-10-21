import type { PoolClient } from 'pg';
import type { FirstReactionGenerationPool, FirstReactionSettings } from './first-reaction-settings.js';
import { normalizeKeywordToken } from './first-reaction-settings.js';
import {
  FIRST_REACTION_BUILTIN_CASINO_WORDS,
  FIRST_REACTION_BUILTIN_GENERAL_WORDS,
} from './first-reaction-word-banks.js';

export function resolveWordPool(
  pool: FirstReactionGenerationPool,
  customWords: string[],
): string[] {
  if (pool === 'custom_list') {
    const unique = [...new Set(customWords.map(normalizeKeywordToken))].filter(
      (w) => w.length >= 2 && w.length <= 20,
    );
    return unique;
  }
  if (pool === 'builtin_general') {
    return [...FIRST_REACTION_BUILTIN_GENERAL_WORDS];
  }
  return [...FIRST_REACTION_BUILTIN_CASINO_WORDS];
}

export async function pickGeneratedKeyword(
  client: PoolClient,
  firstReactionId: number,
  settings: FirstReactionSettings,
): Promise<{ keyword: string; generationMeta: Record<string, unknown> }> {
  const pool = resolveWordPool(settings.generationPool, settings.customWords);
  if (pool.length === 0) {
    throw new Error('EMPTY_WORD_POOL');
  }

  let candidates = pool;
  if (settings.avoidRepeatUntilPoolExhausted) {
    const used = await client.query<{ keyword: string }>(
      `
        SELECT keyword
        FROM first_reaction_draw
        WHERE first_reaction_id = $1
          AND keyword_source = 'generated'
        ORDER BY created_at DESC
        LIMIT $2
      `,
      [firstReactionId, pool.length],
    );
    const usedSet = new Set(used.rows.map((r) => r.keyword));
    const fresh = pool.filter((w) => !usedSet.has(w));
    if (fresh.length > 0) {
      candidates = fresh;
    }
  }

  const index = Math.floor(Math.random() * candidates.length);
  const keyword = candidates[index]!;

  return {
    keyword,
    generationMeta: {
      pool: settings.generationPool,
      candidateCount: candidates.length,
      pickedIndex: index,
    },
  };
}

export function resolveManualKeyword(
  settings: FirstReactionSettings,
  overrideKeyword: string | undefined,
): string {
  const fromOverride = overrideKeyword
    ? normalizeKeywordToken(overrideKeyword)
    : '';
  if (fromOverride.length > 0) {
    return fromOverride;
  }
  if (
    settings.manualScope === 'per_session' &&
    settings.sessionKeyword &&
    settings.sessionKeyword.length > 0
  ) {
    return settings.sessionKeyword;
  }
  throw new Error('KEYWORD_REQUIRED');
}
