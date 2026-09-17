export function buildPrizeSpinOverlayPath(ucid: string): string {
  return `/prize-spin/widget/${encodeURIComponent(ucid)}`
}

export function buildPrizeSpinObsOverlayUrl(ucid: string): string {
  return `${window.location.origin}${buildPrizeSpinOverlayPath(ucid)}`
}
