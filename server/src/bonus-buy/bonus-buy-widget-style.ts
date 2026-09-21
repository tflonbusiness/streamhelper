import type { BonusBuyWidgetStyleSettings } from './bonus-buy-widget-defaults.js';

const STYLE_KEYS: Array<keyof BonusBuyWidgetStyleSettings> = [
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
];

function assertWidgetHexColor(value: string, field: string): string {
  const trimmed = value.trim();
  if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmed)) {
    throw new Error(`INVALID_WIDGET_COLOR:${field}`);
  }
  return trimmed;
}

export function parseBonusBuyWidgetStyleSettings(
  value: unknown,
): BonusBuyWidgetStyleSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('INVALID_WIDGET_STYLE');
  }

  const record = value as Record<string, unknown>;
  for (const key of STYLE_KEYS) {
    if (!(key in record)) {
      throw new Error('INVALID_WIDGET_STYLE');
    }
  }

  const fontFamily = String(record.fontFamily).trim();
  if (fontFamily.length === 0 || fontFamily.length > 200) {
    throw new Error('INVALID_WIDGET_FONT_FAMILY');
  }

  return {
    backgroundColor: assertWidgetHexColor(
      String(record.backgroundColor),
      'backgroundColor',
    ),
    surfaceColor: assertWidgetHexColor(
      String(record.surfaceColor),
      'surfaceColor',
    ),
    borderColor: assertWidgetHexColor(String(record.borderColor), 'borderColor'),
    accentColor: assertWidgetHexColor(String(record.accentColor), 'accentColor'),
    positiveColor: assertWidgetHexColor(
      String(record.positiveColor),
      'positiveColor',
    ),
    negativeColor: assertWidgetHexColor(
      String(record.negativeColor),
      'negativeColor',
    ),
    liveColor: assertWidgetHexColor(String(record.liveColor), 'liveColor'),
    textMutedColor: assertWidgetHexColor(
      String(record.textMutedColor),
      'textMutedColor',
    ),
    borderRadius: Math.min(100, Math.max(0, Math.trunc(Number(record.borderRadius)))),
    padding: Math.min(100, Math.max(0, Math.trunc(Number(record.padding)))),
    fontFamily,
  };
}

export function mergeBonusBuyWidgetStyleSettings(
  existing: BonusBuyWidgetStyleSettings,
  patch: Partial<BonusBuyWidgetStyleSettings>,
): BonusBuyWidgetStyleSettings {
  return parseBonusBuyWidgetStyleSettings({ ...existing, ...patch });
}

export function flattenBonusBuyWidgetStyleSettings(
  settings: BonusBuyWidgetStyleSettings,
): BonusBuyWidgetStyleSettings {
  return parseBonusBuyWidgetStyleSettings(settings);
}
