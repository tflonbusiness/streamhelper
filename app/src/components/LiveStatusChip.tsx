import { Box, Chip } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import {
  statusBadgeColors,
  statusToneChipSx,
} from '@/components/StatusToneChip'

export function LiveStatusChip() {
  const { t } = useTranslation()
  const liveBadgeColor = statusBadgeColors.live

  return (
    <Chip
      label={t('common.live')}
      size="small"
      icon={
        <Box
          component="span"
          aria-hidden
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: liveBadgeColor,
            display: 'block',
            boxShadow: `0 0 6px ${alpha(liveBadgeColor, 0.55)}`,
          }}
        />
      }
      sx={{
        ...statusToneChipSx(liveBadgeColor, true),
        '& .MuiChip-icon': {
          ml: 0.75,
          mr: -0.25,
        },
      }}
    />
  )
}
