import type { FirstReactionSettings } from '@/api/first-reaction'
import { countValidFirstReactionCustomPoolWords } from '@/lib/first-reaction-custom-words'
import { hasEnabledFirstReactionParticipantRole } from '@/lib/first-reaction-role-settings'
import { MODULE_CATALOG } from '@/lib/modules'

export const firstReactionModule = MODULE_CATALOG.find(
  (module) => module.id === 'first-reaction',
)!

export function areFirstReactionSettingsEqual(
  a: FirstReactionSettings,
  b: FirstReactionSettings,
): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export const FIRST_REACTION_WINNER_OVERLAY_SECONDS_MIN = 3
export const FIRST_REACTION_WINNER_OVERLAY_SECONDS_MAX = 30

export function isFirstReactionWinnerOverlaySecondsValid(
  seconds: number,
): boolean {
  return (
    Number.isFinite(seconds) &&
    seconds >= FIRST_REACTION_WINNER_OVERLAY_SECONDS_MIN &&
    seconds <= FIRST_REACTION_WINNER_OVERLAY_SECONDS_MAX
  )
}

export function isFirstReactionSettingsValidForSave(
  settings: FirstReactionSettings,
): boolean {
  if (!isFirstReactionWinnerOverlaySecondsValid(settings.winnerOverlaySeconds)) {
    return false
  }
  if (!hasEnabledFirstReactionParticipantRole(settings)) {
    return false
  }
  if (
    settings.wordSource === 'generated' &&
    settings.generationPool === 'custom_list'
  ) {
    return countValidFirstReactionCustomPoolWords(settings.customWords) > 0
  }
  return true
}
