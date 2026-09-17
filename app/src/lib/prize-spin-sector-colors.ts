export const PRIZE_SPIN_SECTOR_COLORS = [
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
] as const

export function defaultSectorColor(index: number): string {
  return PRIZE_SPIN_SECTOR_COLORS[index % PRIZE_SPIN_SECTOR_COLORS.length]
}
