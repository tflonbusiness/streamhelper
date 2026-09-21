import type { BonusBuyWidgetCardProps } from '@/lib/bonus-buy-widget-presentation'
import { StyledWidgetCard } from '@/components/bonus-buy/widget/bonus-buy-widget-styles'
import { BonusBuyWidgetBestXRow } from '@/components/bonus-buy/widget/BonusBuyWidgetBestXRow'
import { BonusBuyWidgetHeader } from '@/components/bonus-buy/widget/BonusBuyWidgetHeader'
import { BonusBuyWidgetPlayingSections } from '@/components/bonus-buy/widget/BonusBuyWidgetPlayingSections'
import { BonusBuyWidgetSlotList } from '@/components/bonus-buy/widget/BonusBuyWidgetSlotList'
import { BonusBuyWidgetStatsRow } from '@/components/bonus-buy/widget/BonusBuyWidgetStatsRow'

export function BonusBuyWidgetCard({
  record,
  theme,
  slots,
  stats,
  playingSlot,
  playingIndex,
  listSlots,
  bestMultiplierSlot,
  bestMultiplierIndex,
  averageXColor,
  averageXSentiment,
}: BonusBuyWidgetCardProps) {
  return (
    <StyledWidgetCard widgetTheme={theme}>
      <BonusBuyWidgetHeader record={record} slotCount={slots.length} theme={theme} />
      <BonusBuyWidgetStatsRow
        stats={stats}
        theme={theme}
        averageXColor={averageXColor}
        averageXSentiment={averageXSentiment}
      />
      {bestMultiplierSlot && bestMultiplierIndex >= 0 ? (
        <BonusBuyWidgetBestXRow
          slot={bestMultiplierSlot}
          slotIndex={bestMultiplierIndex}
          theme={theme}
        />
      ) : null}
      {playingSlot ? (
        <BonusBuyWidgetPlayingSections
          playingSlot={playingSlot}
          playingIndex={playingIndex}
          theme={theme}
        />
      ) : null}
      <BonusBuyWidgetSlotList listSlots={listSlots} theme={theme} />
    </StyledWidgetCard>
  )
}
