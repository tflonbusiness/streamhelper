import type { TFunction } from 'i18next'
import type { FirstReactionWidgetStyle } from '@/lib/first-reaction-widget-style-defaults'
import i18n from '@/i18n/init-i18n'

const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/

export function validateFirstReactionWidgetStyle(
  style: FirstReactionWidgetStyle,
  t?: TFunction,
): string | null {
  const translate = t ?? i18n.t.bind(i18n)

  const fields: Array<{ key: keyof FirstReactionWidgetStyle; labelKey: string }> =
    [
      { key: 'boltFillStart', labelKey: 'firstReaction.widgetColorBoltFillStart' },
      { key: 'boltFillEnd', labelKey: 'firstReaction.widgetColorBoltFillEnd' },
      { key: 'boltStroke', labelKey: 'firstReaction.widgetColorBoltStroke' },
      { key: 'boltGlow', labelKey: 'firstReaction.widgetColorBoltGlow' },
      { key: 'textHint', labelKey: 'firstReaction.widgetColorTextHint' },
      { key: 'textKeyword', labelKey: 'firstReaction.widgetColorTextKeyword' },
      { key: 'textTimer', labelKey: 'firstReaction.widgetColorTextTimer' },
    ]

  for (const { key, labelKey } of fields) {
    const value = style[key]
    if (typeof value !== 'string' || !hexPattern.test(value.trim())) {
      return translate('validation.fieldColorHex', {
        field: translate(labelKey),
      })
    }
  }

  return null
}

export function validatePreviewBackdropColor(
  color: string,
  t?: TFunction,
): string | null {
  const translate = t ?? i18n.t.bind(i18n)
  if (!hexPattern.test(color.trim())) {
    return translate('validation.fieldColorHex', {
      field: translate('firstReaction.widgetPreviewBackdrop'),
    })
  }
  return null
}
