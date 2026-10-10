import type { TFunction } from 'i18next'
import type { ChatRollRecord } from '@/api/chat-roll'
import { isChatRollArchived } from '@/api/chat-roll'
import { ChatRollLiveStatusChip } from '@/components/chat-roll/ChatRollLiveStatusChip'
import { MutedStatusChip } from '@/components/StatusToneChip'

export function chatRollHistoryStatusChip(record: ChatRollRecord, t: TFunction) {
  if (isChatRollArchived(record)) {
    return <MutedStatusChip label={t('table.archived')} />
  }

  if (record.status === 'live') {
    return <ChatRollLiveStatusChip />
  }

  return <MutedStatusChip label={t('common.inactive')} />
}
