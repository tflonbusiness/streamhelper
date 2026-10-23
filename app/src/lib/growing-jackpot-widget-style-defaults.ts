export type GrowingJackpotWidgetStyle = {
  prizeText: string
  prizeTextDim: string
  keywordText: string
  timerText: string
}

export const GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS: GrowingJackpotWidgetStyle =
  {
    prizeText: '#d4af37',
    prizeTextDim: 'rgba(212, 175, 55, 0.85)',
    keywordText: '#fff8e6',
    timerText: '#fff8dc',
  }

export function mergeGrowingJackpotWidgetStyle(
  base: GrowingJackpotWidgetStyle,
  patch: Partial<GrowingJackpotWidgetStyle> | undefined,
): GrowingJackpotWidgetStyle {
  if (!patch) {
    return base
  }
  return { ...base, ...patch }
}

/** Preview canvas only — not saved to the server or OBS overlay. */
export const GROWING_JACKPOT_WIDGET_PREVIEW_BACKDROP_DEFAULT = '#000000'
