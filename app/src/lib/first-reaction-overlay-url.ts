import { firstReactionWidgetRoute } from '@/lib/routes'

export function buildFirstReactionOverlayPath(accountUcid: string): string {
  return firstReactionWidgetRoute(accountUcid)
}

export function buildFirstReactionObsOverlayUrl(accountUcid: string): string {
  if (typeof window === 'undefined') {
    return firstReactionWidgetRoute(accountUcid)
  }
  return `${window.location.origin}${firstReactionWidgetRoute(accountUcid)}`
}
