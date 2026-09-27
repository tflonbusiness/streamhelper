import type { BonusBuyWidgetCardRecord } from '@/lib/bonus-buy-widget-presentation'
import type { BonusBuyWidgetTheme } from '@/lib/bonus-buy-widget-presentation'
import {
  StyledHeaderIconWrap,
  StyledHeaderLeft,
  StyledHeaderTitle,
  StyledHeaderTitleIcon,
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
        <StyledHeaderIconWrap aria-hidden>
          <StyledHeaderTitleIcon />
        </StyledHeaderIconWrap>
        <StyledHeaderTitle title={record.name}>{record.name}</StyledHeaderTitle>
      </StyledHeaderLeft>
      <StyledSlotCountPill widgetTheme={theme}>
        <StyledSlotCountIcon textColor={theme.accentColor} aria-hidden />
        <StyledSlotCountValue component="span">{slotCount}</StyledSlotCountValue>
      </StyledSlotCountPill>
    </StyledWidgetHeader>
  )
}
