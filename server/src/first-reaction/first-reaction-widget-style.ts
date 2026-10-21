import { BadRequestException } from '@nestjs/common';

export type FirstReactionWidgetStyle = {
  boltFillStart: string;
  boltFillEnd: string;
  boltStroke: string;
  boltGlow: string;
  textHint: string;
  textKeyword: string;
  textTimer: string;
};

export const FIRST_REACTION_WIDGET_STYLE_DEFAULTS: FirstReactionWidgetStyle = {
  boltFillStart: '#FFF9C4',
  boltFillEnd: '#FFC107',
  boltStroke: '#FFFDE7',
  boltGlow: '#FFE566',
  textHint: '#FFF8E6',
  textKeyword: '#FFFEF7',
  textTimer: '#FFF8DC',
};

const HEX_COLOR = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR.test(value.trim());
}

export function parseFirstReactionWidgetStyle(
  raw: unknown,
): FirstReactionWidgetStyle {
  const base = { ...FIRST_REACTION_WIDGET_STYLE_DEFAULTS };
  if (raw === null || raw === undefined) {
    return base;
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return base;
  }
  const input = raw as Record<string, unknown>;

  return {
    boltFillStart: isHexColor(input.boltFillStart)
      ? input.boltFillStart.trim()
      : base.boltFillStart,
    boltFillEnd: isHexColor(input.boltFillEnd)
      ? input.boltFillEnd.trim()
      : base.boltFillEnd,
    boltStroke: isHexColor(input.boltStroke)
      ? input.boltStroke.trim()
      : base.boltStroke,
    boltGlow: isHexColor(input.boltGlow)
      ? input.boltGlow.trim()
      : base.boltGlow,
    textHint: isHexColor(input.textHint)
      ? input.textHint.trim()
      : base.textHint,
    textKeyword: isHexColor(input.textKeyword)
      ? input.textKeyword.trim()
      : base.textKeyword,
    textTimer: isHexColor(input.textTimer)
      ? input.textTimer.trim()
      : base.textTimer,
  };
}

export function mergeFirstReactionWidgetStyle(
  current: FirstReactionWidgetStyle,
  patch: Partial<FirstReactionWidgetStyle> | undefined,
): FirstReactionWidgetStyle {
  if (!patch) {
    return current;
  }
  return parseFirstReactionWidgetStyle({ ...current, ...patch });
}

export function assertValidFirstReactionWidgetStylePatch(
  patch: Partial<FirstReactionWidgetStyle>,
): void {
  const hexKeys = [
    'boltFillStart',
    'boltFillEnd',
    'boltStroke',
    'boltGlow',
    'textHint',
    'textKeyword',
    'textTimer',
  ] as const;
  for (const key of hexKeys) {
    const value = patch[key];
    if (value !== undefined && !isHexColor(value)) {
      throw new BadRequestException(`Invalid ${key}`);
    }
  }
}
