import type { GrowingJackpotSettings } from '@/api/growing-jackpot'
import { hasEnabledFirstReactionParticipantRole } from '@/lib/first-reaction-role-settings'
import { MODULE_CATALOG } from '@/lib/modules'

export const growingJackpotModule = MODULE_CATALOG.find(
  (module) => module.id === 'growing-jackpot',
)!

export function areGrowingJackpotSettingsEqual(
  a: GrowingJackpotSettings,
  b: GrowingJackpotSettings,
): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export const GROWING_JACKPOT_WINNER_OVERLAY_SECONDS_MIN = 3
export const GROWING_JACKPOT_WINNER_OVERLAY_SECONDS_MAX = 30

export function isGrowingJackpotWinnerOverlaySecondsValid(
  seconds: number,
): boolean {
  return (
    Number.isFinite(seconds) &&
    seconds >= GROWING_JACKPOT_WINNER_OVERLAY_SECONDS_MIN &&
    seconds <= GROWING_JACKPOT_WINNER_OVERLAY_SECONDS_MAX
  )
}

export function isGrowingJackpotSettingsValidForSave(
  settings: GrowingJackpotSettings,
): boolean {
  if (
    !isGrowingJackpotWinnerOverlaySecondsValid(settings.winnerOverlaySeconds)
  ) {
    return false
  }
  if (!hasEnabledFirstReactionParticipantRole(settings)) {
    return false
  }
  return settings.joinKeyword.trim().length >= 2
}
