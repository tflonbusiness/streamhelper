import type { BonusBuyWidgetCardRecord } from '@/lib/bonus-buy-widget-presentation'
import type { BonusBuyWidgetTheme } from '@/lib/bonus-buy-widget-presentation'
import {
  StyledHeaderGiftIcon,
  StyledHeaderIconWrap,
  StyledHeaderLeft,
  StyledHeaderTitle,
  StyledSlotCountIcon,
  StyledSlotCountPill,
  StyledSlotCountValue,
  StyledWidgetHeader,
} from '@/components/bonus-buy/widget/bonus-buy-widget-styles'

type BonusBuyWidgetHeaderProps = {
  record: BonusBuyWidgetCardRecord
  slotCount: number
  theme: BonusBuyWidgetTheme
}

export function BonusBuyWidgetHeader({
  record,
  slotCount,
  theme,
}: BonusBuyWidgetHeaderProps) {
  return (
    <StyledWidgetHeader>
      <StyledHeaderLeft>
        <StyledHeaderIconWrap textColor={theme.accentColor}>
          <StyledHeaderGiftIcon aria-hidden />
        </StyledHeaderIconWrap>
        <StyledHeaderTitle>Bonus Buy #{record.id}</StyledHeaderTitle>
      </StyledHeaderLeft>
      <StyledSlotCountPill widgetTheme={theme}>
        <StyledSlotCountIcon textColor={theme.accentColor} aria-hidden />
        <StyledSlotCountValue>{slotCount}</StyledSlotCountValue>
      </StyledSlotCountPill>
    </StyledWidgetHeader>
  )
}
