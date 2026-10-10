import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { BonusBuyWidgetLivePulseIcon } from '@/components/bonus-buy/widget/bonus-buy-widget-icons'
import {
  StatusToneChip,
  statusBadgeColors,
} from '@/components/StatusToneChip'

const StyledLivePulseIcon = styled(BonusBuyWidgetLivePulseIcon)({
  fontSize: 16,
  width: 16,
  height: 16,
  flexShrink: 0,
  color: statusBadgeColors.live,
  display: 'block',
  lineHeight: 0,
  '& svg': {
    display: 'block',
  },
})

export function ChatRollLiveStatusChip() {
  const { t } = useTranslation()

  return (
    <StatusToneChip
      icon={<StyledLivePulseIcon aria-hidden />}
      label={t('common.live')}
      color={statusBadgeColors.live}
    />
  )
}
