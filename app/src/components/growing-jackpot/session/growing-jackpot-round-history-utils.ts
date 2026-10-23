import type { TFunction } from 'i18next'
import type { GrowingJackpotRound } from '@/api/growing-jackpot'

export function growingJackpotRoundEndedAt(round: GrowingJackpotRound): string {
  return round.closedAt ?? round.createdAt
}

export function growingJackpotRoundOutcomeLabel(
  round: GrowingJackpotRound,
  t: TFunction,
): string {
  if (round.phase === 'accepting') {
    return t('growingJackpot.roundOutcomeAccepting')
  }
  if (round.phase === 'drawing') {
    return t('growingJackpot.roundOutcomeDrawing')
  }
  switch (round.result) {
    case 'won':
      return t('growingJackpot.roundOutcomeWon')
    case 'no_participants':
      return t('growingJackpot.roundOutcomeNoParticipants')
    case 'stopped':
      return t('growingJackpot.roundOutcomeStopped')
    case 'cancelled':
      return t('growingJackpot.roundOutcomeCancelled')
    default:
      return t('growingJackpot.roundOutcomeClosed')
  }
}
