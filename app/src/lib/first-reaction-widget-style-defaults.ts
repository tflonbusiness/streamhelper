export type FirstReactionWidgetStyle = {
  boltFillStart: string
  boltFillEnd: string
  boltStroke: string
  boltGlow: string
  textHint: string
  textKeyword: string
  textTimer: string
}

export const FIRST_REACTION_WIDGET_STYLE_DEFAULTS: FirstReactionWidgetStyle = {
  boltFillStart: '#FFF9C4',
  boltFillEnd: '#FFC107',
  boltStroke: '#FFFDE7',
  boltGlow: '#FFE566',
  textHint: '#FFF8E6',
  textKeyword: '#FFFEF7',
  textTimer: '#FFF8DC',
}

export function mergeFirstReactionWidgetStyle(
  base: FirstReactionWidgetStyle,
  patch: Partial<FirstReactionWidgetStyle> | undefined,
): FirstReactionWidgetStyle {
  if (!patch) {
    return base
  }
  return { ...base, ...patch }
}

/** Preview canvas only — not saved to the server or OBS overlay. */
export const FIRST_REACTION_WIDGET_PREVIEW_BACKDROP_DEFAULT = '#000000'
