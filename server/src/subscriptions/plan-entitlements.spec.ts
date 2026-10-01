import { describe, expect, it } from 'vitest';
import {
  buildEntitlementEnvelope,
  evaluateEntitlementCompliance,
  normalizePlanTier,
  PLAN_ENTITLEMENTS,
} from './plan-entitlements.js';

describe('plan-entitlements', () => {
  it('normalizes legacy full to trial tier', () => {
    expect(normalizePlanTier('full')).toBe('trial');
    expect(normalizePlanTier('trial')).toBe('trial');
    expect(normalizePlanTier('max')).toBe('max');
  });

  it('detects over_limit when sectors exceed trial cap', () => {
    const usage = {
      sessions: { bonusBuy: 1, prizeSpin: 1, chatRoll: 0 },
      bonusBuySlots: null,
      prizeSpinSectors: 11,
      moderatorMembers: 0,
    };
    expect(
      evaluateEntitlementCompliance(PLAN_ENTITLEMENTS.trial, usage),
    ).toBe('over_limit');
  });

  it('returns ok when within trial limits', () => {
    const envelope = buildEntitlementEnvelope('trial', {
      sessions: { bonusBuy: 2, prizeSpin: 1, chatRoll: 1 },
      bonusBuySlots: 20,
      prizeSpinSectors: 10,
      moderatorMembers: 1,
    });
    expect(envelope.compliance).toBe('ok');
  });

  it('module scope ignores other modules session excess', () => {
    const usage = {
      sessions: { bonusBuy: 2, prizeSpin: 5, chatRoll: 0 },
      bonusBuySlots: null,
      prizeSpinSectors: null,
      moderatorMembers: 0,
    };
    expect(
      buildEntitlementEnvelope('trial', usage, {
        kind: 'module',
        module: 'bonusBuy',
      }).compliance,
    ).toBe('ok');
    expect(
      buildEntitlementEnvelope('trial', usage, {
        kind: 'module',
        module: 'prizeSpin',
      }).compliance,
    ).toBe('over_limit');
  });

  it('max tier never over_limit from counts alone', () => {
    const envelope = buildEntitlementEnvelope('max', {
      sessions: { bonusBuy: 100, prizeSpin: 100, chatRoll: 100 },
      bonusBuySlots: 500,
      prizeSpinSectors: 500,
      moderatorMembers: 50,
    });
    expect(envelope.compliance).toBe('ok');
  });
});
