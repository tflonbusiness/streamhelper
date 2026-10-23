import type { GrowingJackpotWidgetStyle } from '@/lib/growing-jackpot-widget-style-defaults'
import { GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS } from '@/lib/growing-jackpot-widget-style-defaults'

export type GrowingJackpotWidgetThemePreset = {
  id: string
  name: string
  style: GrowingJackpotWidgetStyle
}

const PRESET_STYLE_KEYS: Array<keyof GrowingJackpotWidgetStyle> = [
  'prizeText',
  'prizeTextDim',
  'keywordText',
  'timerText',
]

function normalizeColor(value: string): string {
  return value.trim().toUpperCase()
}

function presetStyleMatches(
  draft: GrowingJackpotWidgetStyle,
  styleSettings: GrowingJackpotWidgetStyle,
): boolean {
  return PRESET_STYLE_KEYS.every(
    (key) => normalizeColor(draft[key]) === normalizeColor(styleSettings[key]),
  )
}

export const GROWING_JACKPOT_WIDGET_THEME_PRESETS: GrowingJackpotWidgetThemePreset[] =
  [
    {
      id: 'main',
      name: 'Main',
      style: { ...GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS },
    },
    {
      id: 'classic',
      name: 'Classic',
      style: {
        prizeText: '#E6A800',
        prizeTextDim: 'rgba(230, 168, 0, 0.82)',
        keywordText: '#FFFEF5',
        timerText: '#F5E6B8',
      },
    },
    {
      id: 'electric',
      name: 'Electric',
      style: {
        prizeText: '#269BFF',
        prizeTextDim: 'rgba(38, 155, 255, 0.85)',
        keywordText: '#F5FAFF',
        timerText: '#C8E4FF',
      },
    },
    {
      id: 'ruby',
      name: 'Ruby',
      style: {
        prizeText: '#E6193C',
        prizeTextDim: 'rgba(230, 25, 60, 0.85)',
        keywordText: '#FFF5F7',
        timerText: '#FFC8D4',
      },
    },
    {
      id: 'purple',
      name: 'Purple',
      style: {
        prizeText: '#A855F7',
        prizeTextDim: 'rgba(168, 85, 247, 0.85)',
        keywordText: '#FBF5FF',
        timerText: '#E8D4FF',
      },
    },
    {
      id: 'midnight',
      name: 'Midnight',
      style: {
        prizeText: '#9CA3AF',
        prizeTextDim: 'rgba(156, 163, 175, 0.88)',
        keywordText: '#FAFAFA',
        timerText: '#D4D4D8',
      },
    },
    {
      id: 'neon',
      name: 'Neon',
      style: {
        prizeText: '#FF2BD6',
        prizeTextDim: 'rgba(255, 43, 214, 0.85)',
        keywordText: '#FFF5FC',
        timerText: '#FFC8F0',
      },
    },
  ]

export function getGrowingJackpotPresetPreviewDots(
  styleSettings: GrowingJackpotWidgetStyle,
): [string, string, string] {
  return [styleSettings.prizeText, styleSettings.keywordText, styleSettings.timerText]
}

export function matchGrowingJackpotWidgetPresetFromList(
  draft: GrowingJackpotWidgetStyle,
  presets: GrowingJackpotWidgetThemePreset[] = GROWING_JACKPOT_WIDGET_THEME_PRESETS,
): string | null {
  for (const preset of presets) {
    if (presetStyleMatches(draft, preset.style)) {
      return preset.id
    }
  }
  return null
}

export function applyGrowingJackpotWidgetPreset(
  draft: GrowingJackpotWidgetStyle,
  presetId: string,
  presets: GrowingJackpotWidgetThemePreset[] = GROWING_JACKPOT_WIDGET_THEME_PRESETS,
): GrowingJackpotWidgetStyle {
  const preset = presets.find((entry) => entry.id === presetId)
  if (!preset) {
    return draft
  }
  return { ...preset.style }
}
