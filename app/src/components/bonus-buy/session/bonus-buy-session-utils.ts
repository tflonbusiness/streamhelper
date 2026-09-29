import type { Theme } from '@mui/material/styles'
import type { BonusBuySlot } from '@/api/bonus-buy'
import { MODULE_CATALOG } from '@/lib/modules'

export const bonusBuyModule = MODULE_CATALOG.find(
  (module) => module.id === 'bonus-buy',
)!

export { formatBonusBuyMoney, formatUsd } from '@/lib/bonus-buy-format'

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function signedValueColor(
  value: number,
  theme: Theme,
): string | undefined {
  if (value > 0) {
    return theme.palette.success.main
  }
  if (value < 0) {
    return theme.palette.error.main
  }
  return undefined
}

export function parseAverageX(value: string): number {
  return Number.parseFloat(value.replace(/x$/i, ''))
}

export function buildBonusBuySlotsSnapshot(slots: BonusBuySlot[]): string {
  return slots
    .map(
      (slot) =>
        `${slot.id}:${slot.name}:${slot.purchaseAmount}:${slot.winAmount ?? ''}:${slot.providerName ?? ''}:${slot.status}`,
    )
    .join('|')
}
