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
        currencyCode={record.currencyCode}
        averageXColor={averageXColor}
        averageXSentiment={averageXSentiment}
      />
      {bestMultiplierSlot && bestMultiplierIndex >= 0 ? (
        <BonusBuyWidgetBestXRow
          slot={bestMultiplierSlot}
          theme={theme}
          currencyCode={record.currencyCode}
        />
      ) : null}
      {playingSlot ? (
        <BonusBuyWidgetPlayingSections
          playingSlot={playingSlot}
          playingIndex={playingIndex}
          theme={theme}
          currencyCode={record.currencyCode}
        />
      ) : null}
      <BonusBuyWidgetSlotList
        listSlots={listSlots}
        theme={theme}
        currencyCode={record.currencyCode}
      />
    </StyledWidgetCard>
  )
}
