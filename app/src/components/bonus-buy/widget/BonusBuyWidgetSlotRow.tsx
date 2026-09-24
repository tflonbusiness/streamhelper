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
  getWidgetProviderLabel,
  isWinPositive,
} from '@/components/bonus-buy/widget/bonus-buy-widget-slot-utils'

type BonusBuyWidgetSlotRowProps = {
  slot: BonusBuySlot
  index: number
  theme: BonusBuyWidgetTheme
  currencyCode: string
}

export function BonusBuyWidgetSlotRow({
  slot,
  index,
  theme,
  currencyCode,
}: BonusBuyWidgetSlotRowProps) {
  const positive = isWinPositive(slot)
  const resultColor =
    slot.winAmount === null
      ? theme.textMutedColor
      : positive
        ? theme.positiveColor
        : theme.negativeColor
  const badgeColor = positive ? theme.positiveColor : theme.negativeColor
  const providerLabel = getWidgetProviderLabel(slot.providerName)

  return (
    <StyledSlotRow widgetTheme={theme} cellHeight={74}>
      <StyledSlotInfo titleOnlyCentered={providerLabel === null}>
        <StyledSlotName>{index + 1}. {slot.name}</StyledSlotName>
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
