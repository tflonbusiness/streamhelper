import { Box, Chip } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { BonusBuyWidgetLivePulseIcon } from '@/components/bonus-buy/widget/bonus-buy-widget-icons'
import { colors } from '@/theme/colors'

const StyledLivePulseIcon = styled(BonusBuyWidgetLivePulseIcon)({
  fontSize: 16,
  width: 16,
  height: 16,
  flexShrink: 0,
  color: colors.error[500],
  display: 'block',
  lineHeight: 0,
  '& svg': {
    display: 'block',
  },
})

export function ChatRollLiveStatusChip() {
  const { t } = useTranslation()

  return (
    <Chip
      label={
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            lineHeight: 1,
          }}
        >
          <Box
            component="span"
            sx={{
              width: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            <StyledLivePulseIcon aria-hidden />
          </Box>
          {t('common.live')}
        </Box>
      }
      size="small"
      color="success"
      variant="outlined"
      sx={{
        height: 24,
        flexShrink: 0,
        alignItems: 'center',
        '& .MuiChip-label': {
          pl: 1.25,
          pr: 1.25,
          py: 0,
          lineHeight: 1,
        },
      }}
    />
  )
}
