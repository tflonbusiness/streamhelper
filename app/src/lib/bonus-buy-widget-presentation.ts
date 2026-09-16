import type { BonusBuySlot, BonusBuyWidgetSettings } from '@/api/bonus-buy'
import { computeSessionStats } from '@/lib/bonus-buy-stats'

const AUTO_SCROLL_SECONDS_PER_ITEM = 3.5

export type BonusBuyWidgetTheme = Pick<
  BonusBuyWidgetSettings,
  | 'backgroundColor'
  | 'surfaceColor'
  | 'borderColor'
  | 'accentColor'
  | 'positiveColor'
  | 'negativeColor'
  | 'liveColor'
  | 'textMutedColor'
  | 'borderRadius'
  | 'padding'
  | 'fontFamily'
  | 'width'
  | 'height'
>

export type BonusBuyWidgetCardRecord = {
  id: number
  startBalance: string
}

export type BonusBuyWidgetCardProps = {
  record: BonusBuyWidgetCardRecord
  theme: BonusBuyWidgetTheme
  slots: BonusBuySlot[]
  stats: ReturnType<typeof computeSessionStats>
  playingSlot: BonusBuySlot | null
  playingIndex: number
  listSlots: BonusBuySlot[]
  slotsToRender: BonusBuySlot[]
  autoScrollEnabled: boolean
  autoScrollDuration: number
  averageXColor: string
}

function parseAverageX(value: string): number {
  return Number.parseFloat(value.replace(/x$/i, '')) || 0
}

export function deriveBonusBuyWidgetCardProps(
  record: BonusBuyWidgetCardRecord,
  slots: BonusBuySlot[],
  theme: BonusBuyWidgetTheme,
): BonusBuyWidgetCardProps {
  const activeSlots = [...slots].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
  const playing = activeSlots.find((slot) => slot.isNowPlaying) ?? null
  const playingIdx = playing
    ? activeSlots.findIndex((slot) => slot.id === playing.id)
    : -1
  const listSlots = activeSlots.filter((slot) => !slot.isNowPlaying)

  const autoScrollEnabled = listSlots.length > 0
  const slotsToRender = autoScrollEnabled
    ? [...listSlots, ...listSlots]
    : listSlots
  const autoScrollDuration = Math.max(
    listSlots.length * AUTO_SCROLL_SECONDS_PER_ITEM,
    12,
  )

  const stats = computeSessionStats(record.startBalance, activeSlots)
  const averageXValue = parseAverageX(stats.averageX)
  const averageXColor = averageXValue > 1 ? theme.positiveColor : '#FFFFFF'

  return {
    record,
    theme,
    slots: activeSlots,
    stats,
    playingSlot: playing,
    playingIndex: playingIdx,
    listSlots,
    slotsToRender,
    autoScrollEnabled,
    autoScrollDuration,
    averageXColor,
  }
}
