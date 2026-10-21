import type { TFunction } from 'i18next'

export const FIRST_REACTION_DEFAULT_TITLE = 'First Reaction'
export const FIRST_REACTION_HISTORY_PAGE_SIZE = 10

export function formatFirstReactionLiveSessionHint(t: TFunction): string {
  return t('firstReaction.historyLiveHint')
}
