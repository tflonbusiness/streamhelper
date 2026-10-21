import type {
  FirstReactionWidget,
  FirstReactionWidgetStyle,
  FirstReactionWidgetStylePreset,
} from '@/api/first-reaction'

const PRESET_STYLE_KEYS: Array<keyof FirstReactionWidgetStyle> = [
  'boltFillStart',
  'boltFillEnd',
  'boltStroke',
  'boltGlow',
  'textHint',
  'textKeyword',
  'textTimer',
]

function presetStyleMatches(
  draft: FirstReactionWidgetStyle,
  styleSettings: FirstReactionWidgetStyle,
): boolean {
  return PRESET_STYLE_KEYS.every((key) => {
    const left = draft[key]
    const right = styleSettings[key]
    return left.trim().toUpperCase() === right.trim().toUpperCase()
  })
}

export function getFirstReactionPresetPreviewDots(
  styleSettings: FirstReactionWidgetStyle,
): [string, string, string] {
  return [
    styleSettings.boltFillEnd,
    styleSettings.boltGlow,
    styleSettings.textKeyword,
  ]
}

export function matchFirstReactionWidgetPresetFromList(
  draft: Pick<FirstReactionWidget, 'presetId' | 'style'>,
  presets: FirstReactionWidgetStylePreset[],
): number | null {
  if (draft.presetId !== null && draft.presetId !== undefined) {
    const linked = presets.find((preset) => preset.id === draft.presetId)
    if (linked && presetStyleMatches(draft.style, linked.styleSettings)) {
      return linked.id
    }
  }

  for (const preset of presets) {
    if (presetStyleMatches(draft.style, preset.styleSettings)) {
      return preset.id
    }
  }

  return null
}

export function applyFirstReactionWidgetPresetFromList(
  draft: FirstReactionWidget,
  preset: FirstReactionWidgetStylePreset,
): FirstReactionWidget {
  return {
    ...draft,
    presetId: preset.id,
    style: { ...preset.styleSettings },
  }
}

export function extractFirstReactionWidgetStyleSettings(
  draft: FirstReactionWidget,
): FirstReactionWidgetStyle {
  return {
    boltFillStart: draft.style.boltFillStart.trim(),
    boltFillEnd: draft.style.boltFillEnd.trim(),
    boltStroke: draft.style.boltStroke.trim(),
    boltGlow: draft.style.boltGlow.trim(),
    textHint: draft.style.textHint.trim(),
    textKeyword: draft.style.textKeyword.trim(),
    textTimer: draft.style.textTimer.trim(),
  }
}

export function getFirstReactionWidgetPresetDisplayName(
  preset: FirstReactionWidgetStylePreset,
): string {
  return preset.source === 'user' ? 'Custom' : preset.name
}
