import { Chip } from '@mui/material'
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
      icon={<StyledLivePulseIcon aria-hidden />}
      label={t('common.live')}
      size="small"
      color="success"
      variant="outlined"
      sx={{
        height: 24,
        flexShrink: 0,
        '& .MuiChip-icon': {
          color: colors.error[500],
          ml: 1,
          mr: -0.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
        },
        '& .MuiChip-label': {
          pl: 0.5,
          pr: 1.25,
          py: 0,
          display: 'flex',
          alignItems: 'center',
        },
      }}
    />
  )
}
