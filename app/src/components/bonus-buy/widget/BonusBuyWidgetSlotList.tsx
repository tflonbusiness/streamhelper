import type { BonusBuySlot } from '@/api/bonus-buy'
import type { BonusBuyWidgetTheme } from '@/lib/bonus-buy-widget-presentation'
import {
  StyledSlotListContainer,
  StyledSlotScrollTrack,
} from '@/components/bonus-buy/widget/bonus-buy-widget-styles'
import { BonusBuyWidgetSlotRow } from '@/components/bonus-buy/widget/BonusBuyWidgetSlotRow'

type BonusBuyWidgetSlotListProps = {
  listSlots: BonusBuySlot[]
  slotsToRender: BonusBuySlot[]
  theme: BonusBuyWidgetTheme
  autoScrollEnabled: boolean
  autoScrollDuration: number
}

export function BonusBuyWidgetSlotList({
  listSlots,
  slotsToRender,
  theme,
  autoScrollEnabled,
  autoScrollDuration,
}: BonusBuyWidgetSlotListProps) {
  return (
    <StyledSlotListContainer>
      <StyledSlotScrollTrack
        autoScrollEnabled={autoScrollEnabled}
        autoScrollDuration={autoScrollDuration}
      >
        {slotsToRender.map((slot, index) => (
          <BonusBuyWidgetSlotRow
            key={`${autoScrollEnabled ? Math.floor(index / listSlots.length) : 0}-${slot.id}`}
            slot={slot}
            index={index % listSlots.length}
            theme={theme}
          />
        ))}
      </StyledSlotScrollTrack>
    </StyledSlotListContainer>
  )
}
