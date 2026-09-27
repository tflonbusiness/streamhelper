import type { TFunction } from 'i18next'
import type { BonusBuyWidgetSettings } from '@/api/bonus-buy'
import i18n from '@/i18n/init-i18n'

export function validateBonusBuyWidgetDraft(
  draft: BonusBuyWidgetSettings,
  t?: TFunction,
): string | null {
  const translate = t ?? i18n.t.bind(i18n)
  const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
  const colorFields: Array<keyof BonusBuyWidgetSettings> = [
    'backgroundColor',
    'surfaceColor',
    'borderColor',
    'accentColor',
    'positiveColor',
    'negativeColor',
    'liveColor',
    'textMutedColor',
  ]

  for (const field of colorFields) {
    const value = draft[field]
    if (typeof value !== 'string' || !hexPattern.test(value.trim())) {
      return translate('validation.fieldColorHex', { field })
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
