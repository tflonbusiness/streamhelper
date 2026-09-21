import type { BonusBuyArchivedFilter } from '@/api/bonus-buy'

export const BONUS_BUY_DEFAULT_NAME = 'Bonus Buy'
export const BONUS_BUY_HISTORY_PAGE_SIZE = 10

export function historyEmptyMessage(filter: BonusBuyArchivedFilter): string {
  if (filter === 'true') {
    return 'No archived sessions'
  }

  return 'No bonus buy sessions yet'
}

export function formatBonusBuyUsd(amount: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number.parseFloat(amount))
}

export function formatBonusBuyDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}
