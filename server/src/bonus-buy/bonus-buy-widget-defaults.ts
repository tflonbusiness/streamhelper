export type BonusBuyWidgetStyleSettings = {
  backgroundColor: string;
  surfaceColor: string;
  borderColor: string;
  accentColor: string;
  positiveColor: string;
  negativeColor: string;
  liveColor: string;
  textMutedColor: string;
  borderRadius: number;
  padding: number;
  fontFamily: string;
};

export const BONUS_BUY_WIDGET_DIMENSION_DEFAULTS = {
  width: 500,
  height: 600,
} as const;

export const BONUS_BUY_WIDGET_STYLE_DEFAULTS: BonusBuyWidgetStyleSettings = {
  backgroundColor: '#0A0A0C',
  surfaceColor: '#121215',
  borderColor: '#2F2F31',
  accentColor: '#F59E0B',
  positiveColor: '#10B981',
  negativeColor: '#EF4444',
  liveColor: '#FF2222',
  textMutedColor: '#9CA3AF',
  borderRadius: 20,
  padding: 18,
  fontFamily: 'Inter, system-ui, sans-serif',
};

type SystemPresetSeed = {
  name: string;
  styleSettings: BonusBuyWidgetStyleSettings;
};

function presetColors(
  colors: Pick<
    BonusBuyWidgetStyleSettings,
    | 'backgroundColor'
    | 'surfaceColor'
    | 'borderColor'
    | 'accentColor'
    | 'positiveColor'
    | 'negativeColor'
    | 'liveColor'
    | 'textMutedColor'
  >,
): BonusBuyWidgetStyleSettings {
  return {
    ...BONUS_BUY_WIDGET_STYLE_DEFAULTS,
    ...colors,
  };
}

export const BONUS_BUY_SYSTEM_PRESET_SEEDS: SystemPresetSeed[] = [
  { name: 'Main', styleSettings: BONUS_BUY_WIDGET_STYLE_DEFAULTS },
  {
    name: 'Classic',
    styleSettings: presetColors({
      backgroundColor: '#080304',
      surfaceColor: '#110708',
      borderColor: '#542629',
      accentColor: '#FFF000',
      positiveColor: '#24D6A0',
      negativeColor: '#E52E38',
      liveColor: '#E52E38',
      textMutedColor: '#79696B',
    }),
  },
  {
    name: 'Ruby',
    styleSettings: presetColors({
      backgroundColor: '#060204',
      surfaceColor: '#140609',
      borderColor: '#501018',
      accentColor: '#E6193C',
      positiveColor: '#31D6A3',
      negativeColor: '#FF5368',
      liveColor: '#FF5368',
      textMutedColor: '#785A62',
    }),
  },
  {
    name: 'Scarlet',
    styleSettings: presetColors({
      backgroundColor: '#080203',
      surfaceColor: '#180608',
      borderColor: '#641018',
      accentColor: '#FF3045',
      positiveColor: '#2FE0A5',
      negativeColor: '#FF3B4D',
      liveColor: '#FF3B4D',
      textMutedColor: '#826065',
    }),
  },
  {
    name: 'Purple',
    styleSettings: presetColors({
      backgroundColor: '#07030C',
      surfaceColor: '#12091E',
      borderColor: '#3D1564',
      accentColor: '#D946EF',
      positiveColor: '#2BD9A3',
      negativeColor: '#FF5470',
      liveColor: '#FF5470',
      textMutedColor: '#736086',
    }),
  },
  {
    name: 'Electric Blue',
    styleSettings: presetColors({
      backgroundColor: '#02050A',
      surfaceColor: '#081424',
      borderColor: '#1A4570',
      accentColor: '#269BFF',
      positiveColor: '#25D6A2',
      negativeColor: '#FF5570',
      liveColor: '#FF5570',
      textMutedColor: '#59738C',
    }),
  },
  {
    name: 'Midnight',
    styleSettings: presetColors({
      backgroundColor: '#040405',
      surfaceColor: '#121216',
      borderColor: '#2A2A2E',
      accentColor: '#E7E7E9',
      positiveColor: '#31D6A3',
      negativeColor: '#F05252',
      liveColor: '#F05252',
      textMutedColor: '#58585D',
    }),
  },
  {
    name: 'Neon',
    styleSettings: presetColors({
      backgroundColor: '#040207',
      surfaceColor: '#140920',
      borderColor: '#5A1580',
      accentColor: '#FF2BD6',
      positiveColor: '#25F2B1',
      negativeColor: '#FF496E',
      liveColor: '#FF496E',
      textMutedColor: '#7D698A',
    }),
  },
];

