import type { BonusBuySlot } from '@/api/bonus-buy'
import { formatMultiplierDisplay } from '@/lib/bonus-buy-stats'
import { formatBonusBuyMoney } from '@/lib/bonus-buy-format'
import type { BonusBuyWidgetTheme } from '@/lib/bonus-buy-widget-presentation'
import {
  StyledMultiplierBadge,
  StyledMultiplierValue,
  StyledPurchaseAmount,
  StyledSlotInfo,
  StyledSlotName,
  StyledSlotProvider,
  StyledSlotRow,
  StyledWinAmount,
} from '@/components/bonus-buy/widget/bonus-buy-widget-styles'
import {
  getBonusBuySlotResultColors,
  getWidgetProviderLabel,
} from '@/components/bonus-buy/widget/bonus-buy-widget-slot-utils'

type BonusBuyWidgetSlotRowProps = {
  slot: BonusBuySlot
  theme: BonusBuyWidgetTheme
  currencyCode: string
}

export function BonusBuyWidgetSlotRow({
  slot,
  theme,
  currencyCode,
}: BonusBuyWidgetSlotRowProps) {
  const { winColor: resultColor, multiplierColor: badgeColor } =
    getBonusBuySlotResultColors(slot, {
      positiveColor: theme.positiveColor,
      negativeColor: theme.negativeColor,
      textMutedColor: theme.textMutedColor,
    })
  const providerLabel = getWidgetProviderLabel(slot.providerName)

  return (
    <StyledSlotRow widgetTheme={theme} cellHeight={74}>
      <StyledSlotInfo titleOnlyCentered={providerLabel === null}>
        <StyledSlotName>{slot.sortOrder}. {slot.name}</StyledSlotName>
        {providerLabel ? (
          <StyledSlotProvider textColor={theme.textMutedColor}>
            {providerLabel}
          </StyledSlotProvider>
        ) : null}
      </StyledSlotInfo>
      <StyledPurchaseAmount textColor={theme.textMutedColor}>
        {formatBonusBuyMoney(slot.purchaseAmount, currencyCode)}
      </StyledPurchaseAmount>
      <StyledWinAmount textColor={resultColor}>
        {slot.winAmount !== null
          ? formatBonusBuyMoney(slot.winAmount, currencyCode)
          : '—'}
      </StyledWinAmount>
      {slot.multiplier ? (
        <StyledMultiplierBadge badgeColor={badgeColor}>
          <StyledMultiplierValue textColor={badgeColor}>
            {formatMultiplierDisplay(slot.multiplier)}
          </StyledMultiplierValue>
        </StyledMultiplierBadge>
      ) : null}
    </StyledSlotRow>
  )
}
