import { describe, expect, it } from 'vitest';
import {
  resolveAccountSubscriptionAccess,
  shouldMarkSubscriptionExpired,
} from './account-subscription-access.js';

describe('account-subscription-access', () => {
  it('grants access for active trial before ends_at', () => {
    const endsAt = new Date('2026-10-01T12:00:00.000Z');
    const snapshot = resolveAccountSubscriptionAccess(
      {
        kind: 'trial',
        status: 'active',
        planTier: 'full',
        startsAt: new Date('2026-09-28T12:00:00.000Z'),
        endsAt,
      },
      new Date('2026-09-30T12:00:00.000Z'),
    );

    expect(snapshot.hasAccess).toBe(true);
    expect(snapshot.status).toBe('active');
  });

  it('denies access after ends_at', () => {
    const snapshot = resolveAccountSubscriptionAccess(
      {
        kind: 'trial',
        status: 'active',
        planTier: 'full',
        startsAt: new Date('2026-09-28T12:00:00.000Z'),
        endsAt: new Date('2026-09-30T12:00:00.000Z'),
      },
      new Date('2026-10-01T00:00:00.000Z'),
    );

    expect(snapshot.hasAccess).toBe(false);
    expect(snapshot.status).toBe('expired');
  });

  it('flags rows that need persistence to expired', () => {
    const row = {
      kind: 'trial' as const,
      status: 'active' as const,
      planTier: 'full',
      startsAt: new Date('2026-09-28T12:00:00.000Z'),
      endsAt: new Date('2026-09-30T12:00:00.000Z'),
    };

    expect(
      shouldMarkSubscriptionExpired(row, new Date('2026-10-01T00:00:00.000Z')),
    ).toBe(true);
  });
});
