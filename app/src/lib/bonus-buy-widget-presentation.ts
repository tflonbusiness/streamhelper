import { isBonusBuySlotPlaying, type BonusBuySlot, type BonusBuyWidgetSettings } from '@/api/bonus-buy'
import { computeSessionStats, findHighestMultiplierSlot } from '@/lib/bonus-buy-stats'

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
  name: string
  startBalance: string
  currencyCode: string
}

export type BonusBuyWidgetCardProps = {
  record: BonusBuyWidgetCardRecord
  theme: BonusBuyWidgetTheme
  slots: BonusBuySlot[]
  stats: ReturnType<typeof computeSessionStats>
  playingSlot: BonusBuySlot | null
  playingIndex: number
  listSlots: BonusBuySlot[]
  bestMultiplierSlot: BonusBuySlot | null
  bestMultiplierIndex: number
  averageXColor: string
  averageXSentiment: AverageXSentiment
}

export type AverageXSentiment = 'dissatisfied' | 'neutral' | 'satisfied'

export type AverageXColorTheme = Pick<
  BonusBuyWidgetSettings,
  'positiveColor' | 'negativeColor'
>

export const DEFAULT_AVERAGE_X_COLOR_THEME: AverageXColorTheme = {
  positiveColor: '#10B981',
  negativeColor: '#EF4444',
}

const AVERAGE_X_NEUTRAL_COLOR = '#FACC15'

function parseAverageX(value: string): number {
  return Number.parseFloat(value.replace(/x$/i, '')) || 0
}

export function getAverageXPresentation(
  averageXValue: number,
  theme: AverageXColorTheme,
): { color: string; sentiment: AverageXSentiment } {
  if (averageXValue < 0.9) {
    return { color: theme.negativeColor, sentiment: 'dissatisfied' }
  }
  if (averageXValue < 1.1) {
    return { color: AVERAGE_X_NEUTRAL_COLOR, sentiment: 'neutral' }
  }
  return { color: theme.positiveColor, sentiment: 'satisfied' }
}

export function deriveBonusBuyWidgetCardProps(
  record: BonusBuyWidgetCardRecord,
  slots: BonusBuySlot[],
  theme: BonusBuyWidgetTheme,
): BonusBuyWidgetCardProps {
  const activeSlots = [...slots].sort((left, right) => {
    const byOrder = left.sortOrder - right.sortOrder
    return byOrder !== 0 ? byOrder : left.id - right.id
  })
  const playing = activeSlots.find((slot) => isBonusBuySlotPlaying(slot)) ?? null
  const playingIdx = playing ? playing.sortOrder - 1 : -1
  const listSlots = activeSlots.filter((slot) => !isBonusBuySlotPlaying(slot))
  const bestMultiplierSlot = findHighestMultiplierSlot(activeSlots)
  const bestMultiplierIndex = bestMultiplierSlot
    ? activeSlots.findIndex((slot) => slot.id === bestMultiplierSlot.id)
    : -1

  const stats = computeSessionStats(record.startBalance, activeSlots)
  const averageXValue = parseAverageX(stats.averageX)
  const { color: averageXColor, sentiment: averageXSentiment } = getAverageXPresentation(
    averageXValue,
    theme,
  )

  return {
    record,
    theme,
    slots: activeSlots,
    stats,
    playingSlot: playing,
    playingIndex: playingIdx,
    listSlots,
    bestMultiplierSlot,
    bestMultiplierIndex,
    averageXColor,
    averageXSentiment,
  }
}
