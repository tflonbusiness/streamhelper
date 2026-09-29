import {
  isBonusBuyArchived,
  type BonusBuyArchivedFilter,
  type BonusBuyRecord,
} from '@/api/bonus-buy'
import type { TFunction } from 'i18next'
import { formatBonusBuyMoney } from '@/lib/bonus-buy-format'

export const BONUS_BUY_DEFAULT_NAME = 'Bonus Buy'
export const BONUS_BUY_HISTORY_PAGE_SIZE = 10

export function historyEmptyMessage(filter: BonusBuyArchivedFilter): string {
  if (filter === 'true') {
    return 'No archived sessions'
  }

  return 'No bonus buy sessions yet'
}

export function formatBonusBuyUsd(amount: string, currencyCode = 'USD'): string {
  return formatBonusBuyMoney(amount, currencyCode)
}

export function formatBonusBuyDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export function findLiveBonusBuyRecord(
  records: BonusBuyRecord[],
): BonusBuyRecord | null {
  return (
    records.find(
      (record) => record.status === 'live' && !isBonusBuyArchived(record),
    ) ?? null
  )
}

export function formatBonusBuyLiveSessionHint(t: TFunction): string {
  return t('bonusBuy.historyLiveHint')
}
