import { styled } from '@mui/material/styles'
import type { BonusBuySlot } from '@/api/bonus-buy'
import { BonusBuyWidgetCrownIcon } from '@/components/bonus-buy/widget/bonus-buy-widget-icons'
import { formatBonusBuyMoney } from '@/lib/bonus-buy-format'
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
import {
  getWidgetProviderLabel,
  isWinPositive,
} from '@/components/bonus-buy/widget/bonus-buy-widget-slot-utils'

const StyledCrownIcon = styled(BonusBuyWidgetCrownIcon, {
  shouldForwardProp: (prop) => prop !== 'textColor',
})<{ textColor: string }>(({ textColor }) => ({
  fontSize: 36,
  color: textColor,
}))

type BonusBuyWidgetBestXRowProps = {
  slot: BonusBuySlot
  theme: BonusBuyWidgetTheme
  currencyCode: string
}

type BestXValueProps = {
  slot: BonusBuySlot
  theme: BonusBuyWidgetTheme
  currencyCode: string
}

function BestXValue({ slot, theme, currencyCode }: BestXValueProps) {
  const positive = isWinPositive(slot)
  const multiplierColor = positive ? theme.positiveColor : theme.negativeColor

  if (slot.winAmount !== null && slot.multiplier !== null) {
    return (
      <StyledBestXValueViewport>
        <StyledBestXValueTrack>
          <StyledBestXValueItem textColor="#FFFFFF">
            {formatBonusBuyMoney(slot.winAmount, currencyCode)}
          </StyledBestXValueItem>
          <StyledBestXValueItem textColor={multiplierColor}>
            {formatMultiplierDisplay(slot.multiplier)}
          </StyledBestXValueItem>
        </StyledBestXValueTrack>
      </StyledBestXValueViewport>
    )
  }

  if (slot.winAmount !== null) {
    return (
      <StyledBestWinAmount>
        {formatBonusBuyMoney(slot.winAmount, currencyCode)}
      </StyledBestWinAmount>
    )
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
  currencyCode,
}: BonusBuyWidgetBestXRowProps) {
  const providerLabel = getWidgetProviderLabel(slot.providerName)

  return (
    <StyledWidgetCell widgetTheme={theme} cellHeight={68}>
      <StyledCrownIcon textColor={theme.accentColor} aria-hidden />
      <StyledBestWinInfo titleOnlyCentered={providerLabel === null}>
        <StyledBestWinName>{slot.name}</StyledBestWinName>
        {providerLabel ? (
          <StyledBestWinProvider textColor={theme.textMutedColor}>
            {providerLabel}
          </StyledBestWinProvider>
        ) : null}
      </StyledBestWinInfo>
      <BestXValue slot={slot} theme={theme} currencyCode={currencyCode} />
    </StyledWidgetCell>
  )
}
