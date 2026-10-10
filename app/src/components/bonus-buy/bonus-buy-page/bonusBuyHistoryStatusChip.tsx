import type { TFunction } from 'i18next'
import { isBonusBuyArchived, type BonusBuyRecord } from '@/api/bonus-buy'
import { ChatRollLiveStatusChip } from '@/components/chat-roll/ChatRollLiveStatusChip'
import { MutedStatusChip } from '@/components/StatusToneChip'

export function bonusBuyHistoryStatusChip(record: BonusBuyRecord, t: TFunction) {
  if (isBonusBuyArchived(record)) {
    return <MutedStatusChip label={t('table.archived')} />
  }

  if (record.status === 'live') {
    return <ChatRollLiveStatusChip />
  }

  return <MutedStatusChip label={t('common.inactive')} />
}
