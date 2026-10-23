export type GrowingJackpotWidgetStyle = {
  prizeText: string;
  prizeTextDim: string;
  keywordText: string;
  timerText: string;
};

export const GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS: GrowingJackpotWidgetStyle =
  {
    prizeText: '#d4af37',
    prizeTextDim: 'rgba(212, 175, 55, 0.85)',
    keywordText: '#fff8e6',
    timerText: '#fff8dc',
  };

function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value);
}

function isRgbaColor(value: string): boolean {
  return /^rgba?\([^)]+\)$/.test(value.trim());
}

function parseColor(
  raw: unknown,
  fallback: string,
): string {
  if (typeof raw !== 'string') {
    return fallback;
  }
  const trimmed = raw.trim();
  if (isHexColor(trimmed) || isRgbaColor(trimmed)) {
    return trimmed;
  }
  return fallback;
}

export function parseGrowingJackpotWidgetStyle(
  raw: unknown,
): GrowingJackpotWidgetStyle {
  const base = GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS;
  if (!raw || typeof raw !== 'object') {
    return base;
  }
  const input = raw as Record<string, unknown>;
  return {
    prizeText: parseColor(input.prizeText, base.prizeText),
    prizeTextDim: parseColor(input.prizeTextDim, base.prizeTextDim),
    keywordText: parseColor(input.keywordText, base.keywordText),
    timerText: parseColor(input.timerText, base.timerText),
  };
}

export function mergeGrowingJackpotWidgetStylePatch(
  base: GrowingJackpotWidgetStyle,
  patch: Partial<GrowingJackpotWidgetStyle> | undefined,
): GrowingJackpotWidgetStyle {
  if (!patch) {
    return base;
  }
  return parseGrowingJackpotWidgetStyle({ ...base, ...patch });
}
