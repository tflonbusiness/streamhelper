import type { BonusBuySlot } from '@/api/bonus-buy'

export type BonusBuySlotSortField =
  | 'createdAt'
  | 'slotName'
  | 'purchase'
  | 'win'
  | 'multiplier'

export type BonusBuySlotSortDirection = 'asc' | 'desc'

export type BonusBuySlotSortState = {
  field: BonusBuySlotSortField
  direction: BonusBuySlotSortDirection
}

export const DEFAULT_BONUS_BUY_SLOT_SORT: BonusBuySlotSortState = {
  field: 'createdAt',
  direction: 'asc',
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

export function buildBonusBuySlotNumberMap(
  slots: BonusBuySlot[],
): Map<number, number> {
  const ordered = [...slots].sort((left, right) => {
    const byCreatedAt = left.createdAt.localeCompare(right.createdAt)
    return byCreatedAt !== 0 ? byCreatedAt : left.id - right.id
  })

  const numbers = new Map<number, number>()
  ordered.forEach((slot, index) => {
    numbers.set(slot.id, index + 1)
  })

  return numbers
}

function compareStringField(
  left: string,
  right: string,
  direction: BonusBuySlotSortDirection,
): number {
  const cmp = left.localeCompare(right, undefined, { sensitivity: 'base' })
  return direction === 'asc' ? cmp : -cmp
}

function compareSlots(
  left: BonusBuySlot,
  right: BonusBuySlot,
  field: BonusBuySlotSortField,
  direction: BonusBuySlotSortDirection,
): number {
  let cmp = 0

  switch (field) {
    case 'createdAt':
      cmp = compareStringField(left.createdAt, right.createdAt, direction)
      break
    case 'slotName':
      cmp = compareStringField(left.name, right.name, direction)
      break
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
