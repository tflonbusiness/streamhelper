import {
  computeDisplayPrize,
  GROWING_JACKPOT_DEFAULT_SETTINGS,
  mergeGrowingJackpotSettingsPatch,
  parseGrowingJackpotSettings,
} from './growing-jackpot-settings.js';

describe('computeDisplayPrize', () => {
  it('grows with participant count only', () => {
    const settings = {
      ...GROWING_JACKPOT_DEFAULT_SETTINGS,
      prizeBase: 10,
      prizeStepPerJoin: 2,
      prizeDisplayCap: null,
    };
    expect(computeDisplayPrize(settings, 0)).toBe(10);
    expect(computeDisplayPrize(settings, 5)).toBe(20);
  });

  it('parses settings with clamps and cap null', () => {
    const parsed = parseGrowingJackpotSettings({
      joinKeyword: '  !pool  ',
      timerSeconds: 10_000,
      prizeDisplayCap: null,
      weightCombineMode: 'sum',
      announceWinnerInChat: false,
      winnerOverlaySeconds: 1,
    });
    expect(parsed.joinKeyword).toBe('!pool');
    expect(parsed.timerSeconds).toBe(3600);
    expect(parsed.weightCombineMode).toBe('sum');
    expect(parsed.announceWinnerInChat).toBe(false);
    expect(parsed.winnerOverlaySeconds).toBe(3);
    expect(parsed.prizeDisplayCap).toBeNull();
  });

  it('merges settings patch onto current', () => {
    const next = mergeGrowingJackpotSettingsPatch(
      GROWING_JACKPOT_DEFAULT_SETTINGS,
      { prizeStepPerJoin: 5, joinKeyword: '!enter' },
    );
    expect(next.prizeStepPerJoin).toBe(5);
    expect(next.joinKeyword).toBe('!enter');
    expect(next.timerSeconds).toBe(
      GROWING_JACKPOT_DEFAULT_SETTINGS.timerSeconds,
    );
  });

  it('respects display cap', () => {
    const settings = {
      ...GROWING_JACKPOT_DEFAULT_SETTINGS,
      prizeBase: 0,
      prizeStepPerJoin: 100,
      prizeDisplayCap: 250,
    };
    expect(computeDisplayPrize(settings, 10)).toBe(250);
  });
});
