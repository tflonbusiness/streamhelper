export type SlotNameIndex = {
  names: readonly string[]
  lowers: readonly string[]
}

const DEFAULT_LIMIT = 50

export function buildSlotNameIndex(names: readonly string[]): SlotNameIndex {
  return {
    names,
    lowers: names.map((name) => name.toLowerCase()),
  }
}

export function searchSlotNames(
  index: SlotNameIndex,
  query: string,
  limit = DEFAULT_LIMIT,
): string[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return []
  }

  const prefixMatches: string[] = []
  const containsMatches: string[] = []

  for (let i = 0; i < index.names.length; i += 1) {
    const lower = index.lowers[i]
    const name = index.names[i]
    if (lower.startsWith(normalized)) {
      prefixMatches.push(name)
    } else if (lower.includes(normalized)) {
      containsMatches.push(name)
    }
  }

  return [...prefixMatches, ...containsMatches].slice(0, limit)
}
