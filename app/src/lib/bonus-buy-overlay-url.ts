import { bonusBuyWidgetRoute } from '@/lib/routes'

export function buildBonusBuyOverlayPath(bonusBuyId: number): string {
  return bonusBuyWidgetRoute(bonusBuyId)
}

export function buildBonusBuyObsOverlayUrl(bonusBuyId: number): string {
  return `${window.location.origin}${buildBonusBuyOverlayPath(bonusBuyId)}`
}
