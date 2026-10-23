import { growingJackpotWidgetRoute } from '@/lib/routes'

export function buildGrowingJackpotOverlayPath(accountUcid: string): string {
  return growingJackpotWidgetRoute(accountUcid)
}

export function buildGrowingJackpotObsOverlayUrl(accountUcid: string): string {
  if (typeof window === 'undefined') {
    return growingJackpotWidgetRoute(accountUcid)
  }
  return `${window.location.origin}${growingJackpotWidgetRoute(accountUcid)}`
}
