import type { BonusBuySlot } from '@/api/bonus-buy'

export function isWinPositive(slot: BonusBuySlot): boolean {
  if (slot.winAmount === null) {
    return false
  }
  return Number.parseFloat(slot.winAmount) >= Number.parseFloat(slot.purchaseAmount)
}
