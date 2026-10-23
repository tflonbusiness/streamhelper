import type { TFunction } from 'i18next'
import type { GrowingJackpotRecord } from '@/api/growing-jackpot'
import { ChatRollLiveStatusChip } from '@/components/chat-roll/ChatRollLiveStatusChip'
import { MutedStatusChip } from '@/components/StatusToneChip'

export function growingJackpotHistoryStatusChip(
  record: GrowingJackpotRecord,
  t: TFunction,
) {
  if (record.status === 'archived') {
    return <MutedStatusChip label={t('table.archived')} />
  }
  if (record.status === 'live') {
    return <ChatRollLiveStatusChip />
  }
  return <MutedStatusChip label={t('common.inactive')} />
}
