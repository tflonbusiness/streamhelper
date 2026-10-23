import {
  GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS,
  mergeGrowingJackpotWidgetStylePatch,
  parseGrowingJackpotWidgetStyle,
} from './growing-jackpot-widget-style.js';

describe('parseGrowingJackpotWidgetStyle', () => {
  it('returns defaults for invalid input', () => {
    expect(parseGrowingJackpotWidgetStyle(null)).toEqual(
      GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS,
    );
    expect(parseGrowingJackpotWidgetStyle('bad')).toEqual(
      GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS,
    );
  });

  it('accepts hex and rgba colors', () => {
    const parsed = parseGrowingJackpotWidgetStyle({
      prizeText: '#abc',
      prizeTextDim: 'rgba(10, 20, 30, 0.5)',
      keywordText: '#FFFFFF',
      timerText: 'rgb(1, 2, 3)',
    });
    expect(parsed).toEqual({
      prizeText: '#abc',
      prizeTextDim: 'rgba(10, 20, 30, 0.5)',
      keywordText: '#FFFFFF',
      timerText: 'rgb(1, 2, 3)',
    });
  });

  it('falls back to defaults for invalid colors', () => {
    const parsed = parseGrowingJackpotWidgetStyle({
      prizeText: 'gold',
      prizeTextDim: '#zzzzzz',
      keywordText: 42,
      timerText: 'linear-gradient(red, blue)',
    });
    expect(parsed).toEqual(GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS);
  });
});

describe('mergeGrowingJackpotWidgetStylePatch', () => {
  it('merges partial patch through parse', () => {
    const base = GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS;
    const merged = mergeGrowingJackpotWidgetStylePatch(base, {
      timerText: '#111111',
    });
    expect(merged.timerText).toBe('#111111');
    expect(merged.prizeText).toBe(base.prizeText);
  });

  it('returns base when patch is undefined', () => {
    const base = GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS;
    expect(mergeGrowingJackpotWidgetStylePatch(base, undefined)).toEqual(base);
  });
});
