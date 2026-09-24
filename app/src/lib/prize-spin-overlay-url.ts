import { prizeSpinWidgetRoute } from '@/lib/routes'

export function buildPrizeSpinOverlayPath(prizeSpinId: number): string {
  return prizeSpinWidgetRoute(prizeSpinId)
}

export function buildPrizeSpinObsOverlayUrl(prizeSpinId: number): string {
  return `${window.location.origin}${buildPrizeSpinOverlayPath(prizeSpinId)}`
}
