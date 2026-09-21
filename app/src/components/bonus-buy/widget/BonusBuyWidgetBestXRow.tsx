import { SvgIcon } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { BonusBuySlot } from '@/api/bonus-buy'
import { formatUsd } from '@/lib/bonus-buy-format'
import { formatMultiplierDisplay } from '@/lib/bonus-buy-stats'
import type { BonusBuyWidgetTheme } from '@/lib/bonus-buy-widget-presentation'
import {
  StyledAverageXValue,
  StyledBestWinAmount,
  StyledBestWinInfo,
  StyledBestWinName,
  StyledBestWinProvider,
  StyledBestXValueItem,
  StyledBestXValueTrack,
  StyledBestXValueViewport,
  StyledWidgetCell,
} from '@/components/bonus-buy/widget/bonus-buy-widget-styles'
import { isWinPositive } from '@/components/bonus-buy/widget/bonus-buy-widget-slot-utils'

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
  theme: BonusBuyWidgetTheme
}

type BestXValueProps = {
  slot: BonusBuySlot
  theme: BonusBuyWidgetTheme
}

function BestXValue({ slot, theme }: BestXValueProps) {
  const positive = isWinPositive(slot)
  const multiplierColor = positive ? theme.positiveColor : theme.negativeColor

  if (slot.winAmount !== null && slot.multiplier !== null) {
    return (
      <StyledBestXValueViewport>
        <StyledBestXValueTrack>
          <StyledBestXValueItem textColor="#FFFFFF">
            {formatUsd(slot.winAmount)}
          </StyledBestXValueItem>
          <StyledBestXValueItem textColor={multiplierColor}>
            {formatMultiplierDisplay(slot.multiplier)}
          </StyledBestXValueItem>
        </StyledBestXValueTrack>
      </StyledBestXValueViewport>
    )
  }

  if (slot.winAmount !== null) {
    return <StyledBestWinAmount>{formatUsd(slot.winAmount)}</StyledBestWinAmount>
  }

  return (
    <StyledAverageXValue textColor={multiplierColor}>
      {formatMultiplierDisplay(slot.multiplier)}
    </StyledAverageXValue>
  )
}

export function BonusBuyWidgetBestXRow({
  slot,
  theme,
}: BonusBuyWidgetBestXRowProps) {
  return (
    <StyledWidgetCell widgetTheme={theme} cellHeight={68}>
      <StyledCrownIcon textColor={theme.accentColor} aria-hidden />
      <StyledBestWinInfo>
        <StyledBestWinName>{slot.name}</StyledBestWinName>
        <StyledBestWinProvider textColor={theme.textMutedColor}>
          {slot.providerName ?? '—'}
        </StyledBestWinProvider>
      </StyledBestWinInfo>
      <BestXValue slot={slot} theme={theme} />
    </StyledWidgetCell>
  )
}
