import { Chip } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import type { TFunction } from 'i18next'
import { isChatRollArchived, type ChatRollRecord } from '@/api/chat-roll'
import { colors, toneChipSx } from '@/theme/colors'

const MutedStatusChip = styled(Chip)(({ theme }) => ({
  height: 24,
  fontSize: '0.75rem',
  fontWeight: 500,
  bgcolor: alpha(theme.palette.text.primary, 0.06),
  color: theme.palette.text.secondary,
  border: '1px solid',
  borderColor: alpha(theme.palette.text.primary, 0.1),
}))

export function chatRollHistoryStatusChip(record: ChatRollRecord, t: TFunction) {
  if (isChatRollArchived(record)) {
    return <MutedStatusChip label={t('table.archived')} size="small" />
  }

  if (record.status === 'live') {
    return (
      <Chip
        label={t('common.live')}
        size="small"
        sx={toneChipSx(colors.warning[500])}
      />
    )
  }

  return <MutedStatusChip label={t('common.inactive')} size="small" />
}
