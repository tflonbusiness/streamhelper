import { SvgIcon } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { BonusBuySlot } from '@/api/bonus-buy'
import { formatUsd } from '@/lib/bonus-buy-format'
import type { BonusBuyWidgetTheme } from '@/lib/bonus-buy-widget-presentation'
import {
  StyledBestWinAmount,
  StyledBestWinInfo,
  StyledBestWinName,
  StyledBestWinProvider,
  StyledWidgetCell,
} from '@/components/bonus-buy/widget/bonus-buy-widget-styles'

const StyledCrownIcon = styled(
  (props: { textColor: string }) => (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M5 16 3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.7-2h8.6l.9-5.4-2.1 2.2L12 8.4l-3.1 2.4-2.1-2.2L7.7 14z" />
    </SvgIcon>
  ),
  {
    shouldForwardProp: (prop) => prop !== 'textColor',
  },
)<{ textColor: string }>(({ textColor }) => ({
  fontSize: 36,
  color: textColor,
}))

type BonusBuyWidgetBestXRowProps = {
  slot: BonusBuySlot
  slotIndex: number
  theme: BonusBuyWidgetTheme
}

export function BonusBuyWidgetBestXRow({
  slot,
  slotIndex,
  theme,
}: BonusBuyWidgetBestXRowProps) {
  return (
    <StyledWidgetCell widgetTheme={theme} cellHeight={68}>
      <StyledCrownIcon textColor={theme.accentColor} aria-hidden />
      <StyledBestWinInfo>
        <StyledBestWinName>{slotIndex + 1}. {slot.name}</StyledBestWinName>
        <StyledBestWinProvider textColor={theme.textMutedColor}>
          {slot.providerName ?? '—'}
        </StyledBestWinProvider>
      </StyledBestWinInfo>
      <StyledBestWinAmount>
        {slot.winAmount !== null ? formatUsd(slot.winAmount) : '—'}
      </StyledBestWinAmount>
    </StyledWidgetCell>
  )
}
