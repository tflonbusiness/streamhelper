import type { TFunction } from 'i18next'
import type { FirstReactionDraw } from '@/api/first-reaction'
import { colors } from '@/theme/colors'

export type FirstReactionDrawOutcomeTone =
  | 'live'
  | 'info'
  | 'success'
  | 'warning'
  | 'muted'

export function firstReactionDrawEndedAt(draw: FirstReactionDraw): string {
  return draw.closedAt ?? draw.createdAt
}

export function firstReactionDrawOutcome(
  draw: FirstReactionDraw,
  t: TFunction,
): { label: string; tone: FirstReactionDrawOutcomeTone } {
  if (draw.phase === 'accepting') {
    return { label: t('firstReaction.drawOutcomeAccepting'), tone: 'live' }
  }
  if (draw.phase === 'preview') {
    return { label: t('firstReaction.drawOutcomePreview'), tone: 'info' }
  }
  switch (draw.result) {
    case 'won':
      return { label: t('firstReaction.drawOutcomeWon'), tone: 'success' }
    case 'expired':
      return { label: t('firstReaction.drawOutcomeExpired'), tone: 'warning' }
    case 'cancelled':
      return { label: t('firstReaction.drawOutcomeCancelled'), tone: 'muted' }
    default:
      return { label: t('firstReaction.drawOutcomeClosed'), tone: 'muted' }
  }
}

export function firstReactionDrawOutcomeColor(
  tone: FirstReactionDrawOutcomeTone,
): string {
  switch (tone) {
    case 'live':
      return colors.live[500]
    case 'info':
      return colors.info[500]
    case 'success':
      return colors.success[500]
    case 'warning':
      return colors.warning[500]
    default:
      return colors.neutral[500]
  }
}
