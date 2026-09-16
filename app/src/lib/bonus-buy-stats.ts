import { Decimal } from 'decimal.js'

export type BonusBuySlotStatsInput = {
  purchaseAmount: string
  winAmount: string | null
}

export type BonusBuySessionStats = {
  spent: string
  totalWin: string
  profit: string
  currentBalance: string
  averageX: string
}

export function computeSessionStats(
  startBalance: string,
  slots: BonusBuySlotStatsInput[],
): BonusBuySessionStats {
  const start = new Decimal(startBalance)
  let spent = new Decimal(0)
  let totalWin = new Decimal(0)

  for (const slot of slots) {
    spent = spent.plus(slot.purchaseAmount)
    if (slot.winAmount !== null) {
      totalWin = totalWin.plus(slot.winAmount)
    }
  }

  const profit = totalWin.minus(spent)
  const currentBalance = start.minus(spent).plus(totalWin)
  const averageX = spent.gt(0) ? totalWin.div(spent) : new Decimal(0)

  return {
    spent: spent.toFixed(2),
    totalWin: totalWin.toFixed(2),
    profit: profit.toFixed(2),
    currentBalance: currentBalance.toFixed(2),
    averageX: formatAverageX(averageX),
  }
}

export function formatAverageX(value: Decimal): string {
  if (value.isZero()) {
    return '0x'
  }
  const rounded = value.toDecimalPlaces(1)
  return rounded.mod(1).isZero()
    ? `${rounded.toFixed(0)}x`
    : `${rounded.toFixed(1)}x`
}

export function formatMultiplierDisplay(multiplier: string | null): string {
  if (!multiplier) {
    return '—'
  }
  const value = new Decimal(multiplier)
  return `${value.toFixed(2)}x`
}
