import { Chip } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import type { TFunction } from 'i18next'
import { isBonusBuyArchived, type BonusBuyRecord } from '@/api/bonus-buy'
import { ChatRollLiveStatusChip } from '@/components/chat-roll/ChatRollLiveStatusChip'

const MutedStatusChip = styled(Chip)(({ theme }) => ({
  height: 24,
  fontSize: '0.75rem',
  fontWeight: 500,
  bgcolor: alpha(theme.palette.text.primary, 0.06),
  color: theme.palette.text.secondary,
  border: '1px solid',
  borderColor: alpha(theme.palette.text.primary, 0.1),
}))

export function bonusBuyHistoryStatusChip(record: BonusBuyRecord, t: TFunction) {
  if (isBonusBuyArchived(record)) {
    return <MutedStatusChip label={t('table.archived')} size="small" />
  }

  if (record.status === 'live') {
    return <ChatRollLiveStatusChip />
  }

  return <MutedStatusChip label={t('common.inactive')} size="small" />
}
