import type {
  BonusBuyWidgetSettings,
  BonusBuyWidgetStylePreset,
  BonusBuyWidgetStyleSettings,
} from '@/api/bonus-buy'

const PRESET_STYLE_KEYS: Array<keyof BonusBuyWidgetStyleSettings> = [
  'backgroundColor',
  'surfaceColor',
  'borderColor',
  'accentColor',
  'positiveColor',
  'negativeColor',
  'liveColor',
  'textMutedColor',
  'borderRadius',
  'padding',
  'fontFamily',
]

function presetStyleMatches(
  draft: BonusBuyWidgetSettings,
  styleSettings: BonusBuyWidgetStyleSettings,
): boolean {
  return PRESET_STYLE_KEYS.every((key) => {
    const left = draft[key]
    const right = styleSettings[key]
    if (typeof left === 'string' && typeof right === 'string') {
      return left.trim().toUpperCase() === right.trim().toUpperCase()
    }
    return left === right
  })
}

export function getPresetPreviewDots(
  styleSettings: BonusBuyWidgetStyleSettings,
): [string, string, string] {
  return [
    styleSettings.accentColor,
    styleSettings.positiveColor,
    styleSettings.surfaceColor,
  ]
}

export function matchBonusBuyWidgetPresetFromList(
  draft: BonusBuyWidgetSettings,
  presets: BonusBuyWidgetStylePreset[],
): number | null {
  if (draft.presetId !== null) {
    const linked = presets.find((preset) => preset.id === draft.presetId)
    if (linked && presetStyleMatches(draft, linked.styleSettings)) {
      return linked.id
    }
  }

  for (const preset of presets) {
    if (presetStyleMatches(draft, preset.styleSettings)) {
      return preset.id
    }
  }

  return null
}

export function applyBonusBuyWidgetPresetFromList(
  draft: BonusBuyWidgetSettings,
  preset: BonusBuyWidgetStylePreset,
): BonusBuyWidgetSettings {
  return {
    ...draft,
    ...preset.styleSettings,
    presetId: preset.id,
  }
}

export function extractBonusBuyWidgetStyleSettings(
  draft: BonusBuyWidgetSettings,
): BonusBuyWidgetStyleSettings {
  return {
    backgroundColor: draft.backgroundColor.trim(),
    surfaceColor: draft.surfaceColor.trim(),
    borderColor: draft.borderColor.trim(),
    accentColor: draft.accentColor.trim(),
    positiveColor: draft.positiveColor.trim(),
    negativeColor: draft.negativeColor.trim(),
    liveColor: draft.liveColor.trim(),
    textMutedColor: draft.textMutedColor.trim(),
    borderRadius: draft.borderRadius,
    padding: draft.padding,
    fontFamily: draft.fontFamily.trim(),
  }
}

export function getBonusBuyWidgetPresetDisplayName(
  preset: BonusBuyWidgetStylePreset,
): string {
  return preset.source === 'user' ? 'Custom' : preset.name
}
