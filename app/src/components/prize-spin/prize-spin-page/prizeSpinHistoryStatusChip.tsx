import type { TFunction } from 'i18next'
import type { PrizeSpinRecord } from '@/api/prize-spin'
import { isPrizeSpinArchived } from '@/api/prize-spin'
import { ChatRollLiveStatusChip } from '@/components/chat-roll/ChatRollLiveStatusChip'
import { MutedStatusChip } from '@/components/StatusToneChip'

export function prizeSpinHistoryStatusChip(record: PrizeSpinRecord, t: TFunction) {
  if (isPrizeSpinArchived(record)) {
    return <MutedStatusChip label={t('table.archived')} />
  }

  if (record.status === 'live') {
    return <ChatRollLiveStatusChip />
  }

  return <MutedStatusChip label={t('common.inactive')} />
}
