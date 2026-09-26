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
        <StyledHeaderTitle>{record.name}</StyledHeaderTitle>
      </StyledHeaderLeft>
      <StyledSlotCountPill widgetTheme={theme}>
        <StyledSlotCountIcon textColor={theme.accentColor} aria-hidden />
        <StyledSlotCountValue component="span">{slotCount}</StyledSlotCountValue>
      </StyledSlotCountPill>
    </StyledWidgetHeader>
  )
}
