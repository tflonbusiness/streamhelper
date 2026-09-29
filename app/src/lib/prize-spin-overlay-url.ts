import { prizeSpinWidgetRoute } from '@/lib/routes'

export function buildPrizeSpinOverlayPath(accountUcid: string): string {
  return prizeSpinWidgetRoute(accountUcid)
}

export function buildPrizeSpinObsOverlayUrl(accountUcid: string): string {
  return `${window.location.origin}${buildPrizeSpinOverlayPath(accountUcid)}`
}
