import { prizeSpinWidgetRoute } from '@/lib/routes'

export function buildPrizeSpinOverlayPath(ucid: string): string {
  return prizeSpinWidgetRoute(ucid)
}

export function buildPrizeSpinObsOverlayUrl(ucid: string): string {
  return `${window.location.origin}${buildPrizeSpinOverlayPath(ucid)}`
}
