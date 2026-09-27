import type { TFunction } from 'i18next'
import type { BonusBuyWidgetSettings } from '@/api/bonus-buy'
import i18n from '@/i18n/init-i18n'

export function validateBonusBuyWidgetDraft(
  draft: BonusBuyWidgetSettings,
  t?: TFunction,
): string | null {
  const translate = t ?? i18n.t.bind(i18n)
  const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
  const colorFields = [
    'backgroundColor',
    'surfaceColor',
    'borderColor',
    'accentColor',
    'positiveColor',
    'negativeColor',
    'liveColor',
    'textMutedColor',
  ] as const satisfies ReadonlyArray<keyof BonusBuyWidgetSettings>

  const colorFieldLabelKey: Record<(typeof colorFields)[number], string> = {
    backgroundColor: 'validation.widgetColorBackground',
    surfaceColor: 'validation.widgetColorSurface',
    borderColor: 'validation.widgetColorBorder',
    accentColor: 'validation.widgetColorAccent',
    positiveColor: 'validation.widgetColorPositive',
    negativeColor: 'validation.widgetColorNegative',
    liveColor: 'validation.widgetColorLive',
    textMutedColor: 'validation.widgetColorTextMuted',
  }

  for (const field of colorFields) {
    const value = draft[field]
    if (typeof value !== 'string' || !hexPattern.test(value.trim())) {
      const fieldLabel = translate(colorFieldLabelKey[field])
      return translate('validation.fieldColorHex', { field: fieldLabel })
    }
  }

  if (draft.width < 200 || draft.width > 2400) {
    return translate('validation.widgetWidthRange')
  }
  if (draft.height < 200 || draft.height > 2400) {
    return translate('validation.widgetHeightRange')
  }
  if (draft.borderRadius < 0 || draft.borderRadius > 100) {
    return translate('validation.borderRadiusRange')
  }
  if (draft.padding < 0 || draft.padding > 100) {
    return translate('validation.paddingRange')
  }
  if (!draft.fontFamily.trim() || draft.fontFamily.length > 200) {
    return translate('validation.fontFamilyRange')
  }

  return null
}
