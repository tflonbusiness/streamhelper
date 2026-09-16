import type { BonusBuyWidgetSettings } from '@/api/bonus-buy'

export function validateBonusBuyWidgetDraft(
  draft: BonusBuyWidgetSettings,
): string | null {
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
      return `${field} must be a valid hex color`
    }
  }

  if (draft.width < 200 || draft.width > 2400) {
    return 'Width must be between 200 and 2400'
  }
  if (draft.height < 200 || draft.height > 2400) {
    return 'Height must be between 200 and 2400'
  }
  if (draft.borderRadius < 0 || draft.borderRadius > 100) {
    return 'Border radius must be between 0 and 100'
  }
  if (draft.padding < 0 || draft.padding > 100) {
    return 'Padding must be between 0 and 100'
  }
  if (!draft.fontFamily.trim() || draft.fontFamily.length > 200) {
    return 'Font family must be 1-200 characters'
  }

  return null
}
