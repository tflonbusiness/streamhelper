import type { PrizeSpinSector, PrizeSpinWin } from '@/api/prize-spin'
import { MODULE_CATALOG } from '@/lib/modules'

export const prizeSpinModule = MODULE_CATALOG.find(
  (module) => module.id === 'prize-spin',
)!

export type WinnerSectorStat = {
  sectorId: number
  label: string
  color: string | null
  count: number
  actualPercent: number
}

export function sumWinPercent(sectors: PrizeSpinSector[]): number {
  return sectors.reduce(
    (total, sector) => total + Number.parseFloat(sector.winPercent),
    0,
  )
}

export function isCompleteWinPercentTotal(total: number): boolean {
  return Number(total.toFixed(2)) === 100
}

export function buildWinnerSectorStats(
  wins: PrizeSpinWin[],
  sectors: PrizeSpinSector[],
): { total: number; rows: WinnerSectorStat[] } {
  const activeSectorIds = new Set(sectors.map((sector) => sector.id))
  const activeWins = wins.filter((win) => activeSectorIds.has(win.sectorId))
  const total = activeWins.length
  const counts = new Map<number, number>()

  for (const win of activeWins) {
    counts.set(win.sectorId, (counts.get(win.sectorId) ?? 0) + 1)
  }

  const rows = sectors.map((sector) => {
    const count = counts.get(sector.id) ?? 0

    return {
      sectorId: sector.id,
      label: sector.label,
      color: sector.color,
      count,
      actualPercent: total > 0 ? (count / total) * 100 : 0,
    }
  })

  rows.sort(
    (left, right) =>
      right.count - left.count || left.label.localeCompare(right.label),
  )

  return { total, rows }
}
