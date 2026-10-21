import type { FirstReactionWidgetStyle } from './first-reaction-widget-style.js';

export type FirstReactionSystemPresetSeed = {
  name: string;
  styleSettings: FirstReactionWidgetStyle;
};

function preset(
  styleSettings: FirstReactionWidgetStyle,
): FirstReactionWidgetStyle {
  return styleSettings;
}

export const FIRST_REACTION_SYSTEM_PRESET_SEEDS: FirstReactionSystemPresetSeed[] =
  [
    {
      name: 'Main',
      styleSettings: preset({
        boltFillStart: '#FFF9C4',
        boltFillEnd: '#FFC107',
        boltStroke: '#FFFDE7',
        boltGlow: '#FFE566',
        textHint: '#FFF8E6',
        textKeyword: '#FFFEF7',
        textTimer: '#FFF8DC',
      }),
    },
    {
      name: 'Classic',
      styleSettings: preset({
        boltFillStart: '#FFF000',
        boltFillEnd: '#E6A800',
        boltStroke: '#FFF5B8',
        boltGlow: '#FFD54F',
        textHint: '#E8E0C8',
        textKeyword: '#FFFEF5',
        textTimer: '#F5E6B8',
      }),
    },
    {
      name: 'Electric',
      styleSettings: preset({
        boltFillStart: '#E0F4FF',
        boltFillEnd: '#269BFF',
        boltStroke: '#F0FAFF',
        boltGlow: '#5CB8FF',
        textHint: '#B8D4F0',
        textKeyword: '#F5FAFF',
        textTimer: '#C8E4FF',
      }),
    },
    {
      name: 'Ruby',
      styleSettings: preset({
        boltFillStart: '#FFD0D8',
        boltFillEnd: '#E6193C',
        boltStroke: '#FFE8EC',
        boltGlow: '#FF6B85',
        textHint: '#F0C8D0',
        textKeyword: '#FFF5F7',
        textTimer: '#FFC8D4',
      }),
    },
    {
      name: 'Purple',
      styleSettings: preset({
        boltFillStart: '#F0D4FF',
        boltFillEnd: '#A855F7',
        boltStroke: '#F8EEFF',
        boltGlow: '#C084FC',
        textHint: '#D8C8F0',
        textKeyword: '#FBF5FF',
        textTimer: '#E8D4FF',
      }),
    },
    {
      name: 'Midnight',
      styleSettings: preset({
        boltFillStart: '#E7E7E9',
        boltFillEnd: '#9CA3AF',
        boltStroke: '#F4F4F5',
        boltGlow: '#D4D4D8',
        textHint: '#A1A1AA',
        textKeyword: '#FAFAFA',
        textTimer: '#D4D4D8',
      }),
    },
    {
      name: 'Neon',
      styleSettings: preset({
        boltFillStart: '#FFE0F8',
        boltFillEnd: '#FF2BD6',
        boltStroke: '#FFF0FA',
        boltGlow: '#FF6BE8',
        textHint: '#F0C8E8',
        textKeyword: '#FFF5FC',
        textTimer: '#FFC8F0',
      }),
    },
  ];
