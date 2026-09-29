import { bonusBuyWidgetRoute } from '@/lib/routes'

export function buildBonusBuyOverlayPath(accountUcid: string): string {
  return bonusBuyWidgetRoute(accountUcid)
}

export function buildBonusBuyObsOverlayUrl(accountUcid: string): string {
  return `${window.location.origin}${buildBonusBuyOverlayPath(accountUcid)}`
}
