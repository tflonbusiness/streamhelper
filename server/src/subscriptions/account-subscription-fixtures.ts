import type { AccountSubscriptionSnapshot } from './account-subscription-access.js';

export function activeTrialSubscriptionFixture(
  overrides: Partial<AccountSubscriptionSnapshot> = {},
): AccountSubscriptionSnapshot {
  return {
    kind: 'trial',
    status: 'active',
    planTier: 'full',
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    hasAccess: true,
    ...overrides,
  };
}

export const subscriptionDatabaseMocks = {
  accountHasSubscriptionAccess: async () => true,
  loadAccountSubscriptionSnapshot: async () => activeTrialSubscriptionFixture(),
  getAccountIdByUcid: async (ucid: string) => (ucid ? 10 : null),
};
