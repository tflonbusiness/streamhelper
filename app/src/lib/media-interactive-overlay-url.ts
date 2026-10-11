import { mediaInteractiveWidgetRoute } from '@/lib/routes'

export function buildMediaInteractiveOverlayPath(accountUcid: string): string {
  return mediaInteractiveWidgetRoute(accountUcid)
}

export function buildMediaInteractiveObsOverlayUrl(accountUcid: string): string {
  return `${window.location.origin}${buildMediaInteractiveOverlayPath(accountUcid)}`
}
