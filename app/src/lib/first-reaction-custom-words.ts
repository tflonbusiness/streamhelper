const MIN_POOL_WORD_LENGTH = 2
const MAX_POOL_WORD_LENGTH = 20

export function normalizeFirstReactionKeywordToken(value: string): string {
  return value.trim().toLowerCase().replace(/^!+/, '')
}

export function dedupeFirstReactionCustomWords(words: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of words) {
    const token = normalizeFirstReactionKeywordToken(raw)
    if (token.length === 0 || seen.has(token)) {
      continue
    }
    seen.add(token)
    result.push(token)
  }
  return result
}

export function isFirstReactionPoolKeywordLength(token: string): boolean {
  return (
    token.length >= MIN_POOL_WORD_LENGTH &&
    token.length <= MAX_POOL_WORD_LENGTH
  )
}

export function countValidFirstReactionCustomPoolWords(words: string[]): number {
  return dedupeFirstReactionCustomWords(words).filter(
    isFirstReactionPoolKeywordLength,
  ).length
}
