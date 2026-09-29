import type { BonusBuySlot } from '@/api/bonus-buy'

export type BonusBuySlotSortField = 'purchase' | 'win' | 'multiplier'
export type BonusBuySlotSortDirection = 'asc' | 'desc'

export type BonusBuySlotSortState = {
  field: BonusBuySlotSortField
  direction: BonusBuySlotSortDirection
}

function parseNumericField(value: string | null): number | null {
  if (value === null) {
    return null
  }

  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

function compareNullableNumbers(
  left: number | null,
  right: number | null,
  direction: BonusBuySlotSortDirection,
): number {
  if (left === null && right === null) {
    return 0
  }
  if (left === null) {
    return 1
  }
  if (right === null) {
    return -1
  }

  const diff = left - right
  return direction === 'asc' ? diff : -diff
}

function compareSlots(
  left: BonusBuySlot,
  right: BonusBuySlot,
  field: BonusBuySlotSortField,
  direction: BonusBuySlotSortDirection,
): number {
  let cmp = 0

  switch (field) {
    case 'purchase':
      cmp = compareNullableNumbers(
        parseNumericField(left.purchaseAmount),
        parseNumericField(right.purchaseAmount),
        direction,
      )
      break
    case 'win':
      cmp = compareNullableNumbers(
        parseNumericField(left.winAmount),
        parseNumericField(right.winAmount),
        direction,
      )
      break
    case 'multiplier':
      cmp = compareNullableNumbers(
        parseNumericField(left.multiplier),
        parseNumericField(right.multiplier),
        direction,
      )
      break
  }

  return cmp !== 0 ? cmp : left.id - right.id
}

export function sortBonusBuySlots(
  slots: BonusBuySlot[],
  sort: BonusBuySlotSortState | null,
): BonusBuySlot[] {
  if (!sort) {
    return slots
  }

  return [...slots].sort((left, right) =>
    compareSlots(left, right, sort.field, sort.direction),
  )
}
