import type { PublicFirstReactionWidgetActiveView } from '@/api/first-reaction'

export function getFirstReactionWidgetWinnerDisplayName(
  view: Pick<PublicFirstReactionWidgetActiveView, 'winner'>,
): string | null {
  const name = view.winner?.winnerDisplayName?.trim()
  return name && name.length > 0 ? name : null
}

export function isFirstReactionWidgetAccepting(
  view: Pick<PublicFirstReactionWidgetActiveView, 'phase' | 'keyword'>,
): boolean {
  return view.phase === 'accepting' && Boolean(view.keyword)
}

export function isFirstReactionWidgetOverlayVisible(
  view: PublicFirstReactionWidgetActiveView,
): boolean {
  return (
    isFirstReactionWidgetAccepting(view) ||
    getFirstReactionWidgetWinnerDisplayName(view) !== null
  )
}
