import type { BonusBuySlot } from '@/api/bonus-buy'

/** Non-empty trimmed provider for overlay display; null when absent (no em-dash placeholder). */
export function getWidgetProviderLabel(
  providerName: string | null | undefined,
): string | null {
  const trimmed = providerName?.trim()
  return trimmed ? trimmed : null
}

export function isWinPositive(slot: BonusBuySlot): boolean {
  if (slot.winAmount === null) {
    return false
  }
  return Number.parseFloat(slot.winAmount) >= Number.parseFloat(slot.purchaseAmount)
}

export type BonusBuySlotResultColorTheme = {
  positiveColor: string
  negativeColor: string
  textMutedColor: string
}

export function getBonusBuySlotResultColors(
  slot: BonusBuySlot,
  colorTheme: BonusBuySlotResultColorTheme,
): { winColor: string; multiplierColor: string } {
  const positive = isWinPositive(slot)

  return {
    winColor:
      slot.winAmount === null
        ? colorTheme.textMutedColor
        : positive
          ? colorTheme.positiveColor
          : colorTheme.negativeColor,
    multiplierColor: positive
      ? colorTheme.positiveColor
      : colorTheme.negativeColor,
  }
}
