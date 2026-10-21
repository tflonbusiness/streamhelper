import type { TFunction } from 'i18next'
import type { FirstReactionRecord } from '@/api/first-reaction'
import { ChatRollLiveStatusChip } from '@/components/chat-roll/ChatRollLiveStatusChip'
import { MutedStatusChip } from '@/components/StatusToneChip'

export function firstReactionHistoryStatusChip(
  record: FirstReactionRecord,
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
