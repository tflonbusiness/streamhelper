export const PRIZE_SPIN_SECTOR_COLORS = [
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
] as const;

export function defaultSectorColor(index: number): string {
  return PRIZE_SPIN_SECTOR_COLORS[index % PRIZE_SPIN_SECTOR_COLORS.length];
}

export function isCompleteWinPercentTotal(total: number): boolean {
  return Number(total.toFixed(2)) === 100;
}

export function normalizeWinPercent(value: string | number): string {
  const raw = typeof value === 'number' ? value.toString() : value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
    throw new Error('INVALID_WIN_PERCENT');
  }

  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 100) {
    throw new Error('INVALID_WIN_PERCENT');
  }

  return parsed.toFixed(2);
}

export function normalizeHexColor(
  value: string | null | undefined,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const shortMatch = /^#([0-9A-Fa-f]{3})$/.exec(trimmed);
  if (shortMatch) {
    const [r, g, b] = shortMatch[1].split('');
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  throw new Error('INVALID_COLOR');
}

/** Split 100.00% across `count` sectors; remainder goes to the first rows. */
export function equalWinPercents(count: number): string[] {
  if (count <= 0) {
    return [];
  }

  const totalBasisPoints = 10000;
  const base = Math.floor(totalBasisPoints / count);
  let remainder = totalBasisPoints - base * count;

  return Array.from({ length: count }, () => {
    const basisPoints = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) {
      remainder -= 1;
    }
    return (basisPoints / 100).toFixed(2);
  });
}

export function pickWeightedSectorId<
  T extends { id: number; winPercent: string },
>(sectors: T[]): number {
  const weights = sectors.map((sector) => Number.parseFloat(sector.winPercent));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let remaining = Math.random() * total;

  for (let index = 0; index < sectors.length; index += 1) {
    remaining -= weights[index];
    if (remaining <= 0) {
      return sectors[index].id;
    }
  }

  return sectors[sectors.length - 1].id;
}
