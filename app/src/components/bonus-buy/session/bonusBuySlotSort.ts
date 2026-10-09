import type { BonusBuySlot } from '@/api/bonus-buy'

export function compareBonusBuySlotsByOrder(
  left: BonusBuySlot,
  right: BonusBuySlot,
): number {
  const byOrder = left.sortOrder - right.sortOrder
  return byOrder !== 0 ? byOrder : left.id - right.id
}

export function sortBonusBuySlotsByOrder(slots: BonusBuySlot[]): BonusBuySlot[] {
  return [...slots].sort(compareBonusBuySlotsByOrder)
}
