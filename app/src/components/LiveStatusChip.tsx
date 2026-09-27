import { Box, Chip } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { toneChipSx } from '@/theme/colors'

export function LiveStatusChip() {
  const { t } = useTranslation()
  const theme = useTheme()

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
            bgcolor: theme.palette.error.main,
            display: 'block',
            boxShadow: `0 0 6px ${alpha(theme.palette.error.main, 0.55)}`,
          }}
        />
      }
      sx={{
        ...toneChipSx(theme.palette.error.light),
        flexShrink: 0,
        '& .MuiChip-icon': {
          ml: 0.75,
          mr: -0.25,
        },
      }}
    />
  )
}
