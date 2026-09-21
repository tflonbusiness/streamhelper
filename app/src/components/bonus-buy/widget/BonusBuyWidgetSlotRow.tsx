import type { BonusBuySlot } from '@/api/bonus-buy'
import { formatMultiplierDisplay } from '@/lib/bonus-buy-stats'
import { formatUsd } from '@/lib/bonus-buy-format'
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
import { isWinPositive } from '@/components/bonus-buy/widget/bonus-buy-widget-slot-utils'

type BonusBuyWidgetSlotRowProps = {
  slot: BonusBuySlot
  index: number
  theme: BonusBuyWidgetTheme
}

export function BonusBuyWidgetSlotRow({
  slot,
  index,
  theme,
}: BonusBuyWidgetSlotRowProps) {
  const positive = isWinPositive(slot)
  const resultColor =
    slot.winAmount === null
      ? theme.textMutedColor
      : positive
        ? theme.positiveColor
        : theme.negativeColor
  const badgeColor = positive ? theme.positiveColor : theme.negativeColor

  return (
    <StyledSlotRow widgetTheme={theme} cellHeight={62}>
      <StyledSlotInfo>
        <StyledSlotName>{index + 1}. {slot.name}</StyledSlotName>
        <StyledSlotProvider textColor={theme.textMutedColor}>
          {slot.providerName ?? '—'}
        </StyledSlotProvider>
      </StyledSlotInfo>
      <StyledPurchaseAmount textColor={theme.textMutedColor}>
        {formatUsd(slot.purchaseAmount)}
      </StyledPurchaseAmount>
      <StyledWinAmount textColor={resultColor}>
        {slot.winAmount !== null ? formatUsd(slot.winAmount) : '—'}
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
