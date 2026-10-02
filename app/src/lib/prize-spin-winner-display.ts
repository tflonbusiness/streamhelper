import type { PrizeSpinSector } from '@/api/prize-spin'

export function formatPrizeSpinSectorWinPercent(winPercent: string): string {
  const value = Number.parseFloat(winPercent)
  if (!Number.isFinite(value)) {
    return winPercent.includes('%') ? winPercent : `${winPercent}%`
  }
  return `${Number(value.toFixed(2))}%`
}

export function formatPrizeSpinWinnerSectorLabel(
  sectorLabel: string,
  sectorId: number,
  sectors: PrizeSpinSector[],
  showSectorWeight: boolean,
): string {
  if (!showSectorWeight) {
    return sectorLabel
  }

  const sector = sectors.find((row) => row.id === sectorId)
  if (!sector) {
    return sectorLabel
  }

  return `${sectorLabel} (${formatPrizeSpinSectorWinPercent(sector.winPercent)})`
}
