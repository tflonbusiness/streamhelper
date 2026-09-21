import type {
  BonusBuyWidgetSettings,
  BonusBuyWidgetStylePreset,
  BonusBuyWidgetStyleSettings,
} from '@/api/bonus-buy'

export type BonusBuyWidgetPresetId =
  | 'main'
  | 'classic'
  | 'ruby'
  | 'scarlet'
  | 'purple'
  | 'electric_blue'
  | 'midnight'
  | 'neon'

export type BonusBuyWidgetStyleSnapshot = Pick<
  BonusBuyWidgetSettings,
  | 'width'
  | 'height'
  | 'backgroundColor'
  | 'surfaceColor'
  | 'borderColor'
  | 'accentColor'
  | 'positiveColor'
  | 'negativeColor'
  | 'liveColor'
  | 'textMutedColor'
  | 'borderRadius'
  | 'padding'
  | 'fontFamily'
>

export type BonusBuyWidgetPreset = {
  id: BonusBuyWidgetPresetId
  name: string
  previewDots: [string, string, string]
  style: BonusBuyWidgetStyleSnapshot
}

const SHARED_STYLE_DEFAULTS: Pick<
  BonusBuyWidgetStyleSnapshot,
  'width' | 'height' | 'borderRadius' | 'padding' | 'fontFamily'
> = {
  width: 500,
  height: 600,
  borderRadius: 20,
  padding: 18,
  fontFamily: 'Inter, system-ui, sans-serif',
}

function preset(
  id: BonusBuyWidgetPresetId,
  name: string,
  previewDots: [string, string, string],
  colors: Pick<
    BonusBuyWidgetStyleSnapshot,
    | 'backgroundColor'
    | 'surfaceColor'
    | 'borderColor'
    | 'accentColor'
    | 'positiveColor'
    | 'negativeColor'
    | 'liveColor'
    | 'textMutedColor'
  >,
): BonusBuyWidgetPreset {
  return {
    id,
    name,
    previewDots,
    style: {
      ...SHARED_STYLE_DEFAULTS,
      ...colors,
    },
  }
}

export const BONUS_BUY_WIDGET_PRESETS: BonusBuyWidgetPreset[] = [
  preset('main', 'Main', ['#F59E0B', '#10B981', '#121215'], {
    backgroundColor: '#0A0A0C',
    surfaceColor: '#121215',
    borderColor: '#2F2F31',
    accentColor: '#F59E0B',
    positiveColor: '#10B981',
    negativeColor: '#EF4444',
    liveColor: '#FF2222',
    textMutedColor: '#9CA3AF',
  }),
  preset('classic', 'Classic', ['#FFF000', '#542629', '#24D6A0'], {
    backgroundColor: '#080304',
    surfaceColor: '#110708',
    borderColor: '#542629',
    accentColor: '#FFF000',
    positiveColor: '#24D6A0',
    negativeColor: '#E52E38',
    liveColor: '#E52E38',
    textMutedColor: '#79696B',
  }),
  preset('ruby', 'Ruby', ['#E6193C', '#FF4D6D', '#31D6A3'], {
    backgroundColor: '#060204',
    surfaceColor: '#140609',
    borderColor: '#501018',
    accentColor: '#E6193C',
    positiveColor: '#31D6A3',
    negativeColor: '#FF5368',
    liveColor: '#FF5368',
    textMutedColor: '#785A62',
  }),
  preset('scarlet', 'Scarlet', ['#FF3045', '#FF6675', '#2FE0A5'], {
    backgroundColor: '#080203',
    surfaceColor: '#180608',
    borderColor: '#641018',
    accentColor: '#FF3045',
    positiveColor: '#2FE0A5',
    negativeColor: '#FF3B4D',
    liveColor: '#FF3B4D',
    textMutedColor: '#826065',
  }),
  preset('purple', 'Purple', ['#D946EF', '#E879F9', '#2BD9A3'], {
    backgroundColor: '#07030C',
    surfaceColor: '#12091E',
    borderColor: '#3D1564',
    accentColor: '#D946EF',
    positiveColor: '#2BD9A3',
    negativeColor: '#FF5470',
    liveColor: '#FF5470',
    textMutedColor: '#736086',
  }),
  preset('electric_blue', 'Electric Blue', ['#269BFF', '#5BB8FF', '#25D6A2'], {
    backgroundColor: '#02050A',
    surfaceColor: '#081424',
    borderColor: '#1A4570',
    accentColor: '#269BFF',
    positiveColor: '#25D6A2',
    negativeColor: '#FF5570',
    liveColor: '#FF5570',
    textMutedColor: '#59738C',
  }),
  preset('midnight', 'Midnight', ['#E7E7E9', '#FFFFFF', '#31D6A3'], {
    backgroundColor: '#040405',
    surfaceColor: '#121216',
    borderColor: '#2A2A2E',
    accentColor: '#E7E7E9',
    positiveColor: '#31D6A3',
    negativeColor: '#F05252',
    liveColor: '#F05252',
    textMutedColor: '#58585D',
  }),
  preset('neon', 'Neon', ['#FF2BD6', '#8B5CFF', '#25F2B1'], {
    backgroundColor: '#040207',
    surfaceColor: '#140920',
    borderColor: '#5A1580',
    accentColor: '#FF2BD6',
    positiveColor: '#25F2B1',
    negativeColor: '#FF496E',
    liveColor: '#FF496E',
    textMutedColor: '#7D698A',
  }),
]

const PRESET_BY_ID = new Map(
  BONUS_BUY_WIDGET_PRESETS.map((entry) => [entry.id, entry]),
)

const STYLE_SNAPSHOT_KEYS: Array<keyof BonusBuyWidgetStyleSnapshot> = [
  'width',
  'height',
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

function normalizeHexColor(value: string): string {
  const trimmed = value.trim()
  const shortMatch = /^#([0-9A-Fa-f]{3})$/.exec(trimmed)
  if (shortMatch) {
    const [r, g, b] = shortMatch[1].split('')
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase()
  }
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase()
  }
  return trimmed
}

function normalizeStyleValue(
  key: keyof BonusBuyWidgetStyleSnapshot,
  value: BonusBuyWidgetStyleSnapshot[keyof BonusBuyWidgetStyleSnapshot],
): string | number {
  if (
    key === 'backgroundColor' ||
    key === 'surfaceColor' ||
    key === 'borderColor' ||
    key === 'accentColor' ||
    key === 'positiveColor' ||
    key === 'negativeColor' ||
    key === 'liveColor' ||
    key === 'textMutedColor'
  ) {
    return normalizeHexColor(String(value))
  }
  if (key === 'fontFamily') {
    return String(value).trim()
  }
  return value as number
}

function stylesMatch(
  left: BonusBuyWidgetStyleSnapshot,
  right: BonusBuyWidgetStyleSnapshot,
): boolean {
  return STYLE_SNAPSHOT_KEYS.every(
    (key) =>
      normalizeStyleValue(key, left[key]) === normalizeStyleValue(key, right[key]),
  )
}

export function getBonusBuyWidgetPreset(
  id: BonusBuyWidgetPresetId,
): BonusBuyWidgetPreset {
  const presetEntry = PRESET_BY_ID.get(id)
  if (!presetEntry) {
    throw new Error(`Unknown widget preset: ${id}`)
  }
  return presetEntry
}

export function extractBonusBuyWidgetStyleSnapshot(
  draft: BonusBuyWidgetSettings,
): BonusBuyWidgetStyleSnapshot {
  return {
    width: draft.width,
    height: draft.height,
    backgroundColor: draft.backgroundColor,
    surfaceColor: draft.surfaceColor,
    borderColor: draft.borderColor,
    accentColor: draft.accentColor,
    positiveColor: draft.positiveColor,
    negativeColor: draft.negativeColor,
    liveColor: draft.liveColor,
    textMutedColor: draft.textMutedColor,
    borderRadius: draft.borderRadius,
    padding: draft.padding,
    fontFamily: draft.fontFamily,
  }
}

export function matchBonusBuyWidgetPreset(
  draft: BonusBuyWidgetSettings,
): BonusBuyWidgetPresetId | null {
  const snapshot = extractBonusBuyWidgetStyleSnapshot(draft)
  for (const presetEntry of BONUS_BUY_WIDGET_PRESETS) {
    if (stylesMatch(snapshot, presetEntry.style)) {
      return presetEntry.id
    }
  }
  return null
}

export function applyBonusBuyWidgetPreset(
  draft: BonusBuyWidgetSettings,
  presetId: BonusBuyWidgetPresetId,
): BonusBuyWidgetSettings {
  const presetEntry = getBonusBuyWidgetPreset(presetId)
  return {
    ...draft,
    ...presetEntry.style,
    presetId: null,
  }
}

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
