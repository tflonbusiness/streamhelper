import type { BonusBuySlot } from '@/api/bonus-buy'
import { getAverageXPresentation } from '@/lib/bonus-buy-widget-presentation'

/** Non-empty trimmed provider for overlay display; null when absent (no em-dash placeholder). */
export function getWidgetProviderLabel(
  providerName: string | null | undefined,
): string | null {
  const trimmed = providerName?.trim()
  return trimmed ? trimmed : null
}

export function isWinPositive(slot: BonusBuySlot): boolean {
  const multiplierX = resolveSlotMultiplierX(slot)
  return multiplierX !== null && multiplierX >= 1
}

function resolveSlotMultiplierX(slot: BonusBuySlot): number | null {
  if (slot.multiplier !== null) {
    const parsed = Number.parseFloat(slot.multiplier)
    return Number.isFinite(parsed) ? parsed : null
  }

  if (slot.winAmount === null) {
    return null
  }

  const purchase = Number.parseFloat(slot.purchaseAmount)
  const win = Number.parseFloat(slot.winAmount)
  if (!Number.isFinite(purchase) || purchase <= 0 || !Number.isFinite(win)) {
    return null
  }

  return win / purchase
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
  const multiplierX = resolveSlotMultiplierX(slot)

  if (slot.winAmount === null) {
    return {
      winColor: colorTheme.textMutedColor,
      multiplierColor: colorTheme.textMutedColor,
    }
  }

  const { color: resultColor } = getAverageXPresentation(multiplierX ?? 0, {
    positiveColor: colorTheme.positiveColor,
    negativeColor: colorTheme.negativeColor,
  })

  return {
    winColor: resultColor,
    multiplierColor: slot.multiplier ? resultColor : colorTheme.textMutedColor,
  }
}
