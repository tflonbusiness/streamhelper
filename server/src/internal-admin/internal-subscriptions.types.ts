import type { AccountSubscriptionSnapshot } from '../subscriptions/account-subscription-access.js';

export type SubscriptionAdminMode = 'revoked' | 'trial' | 'paid';

export type SubscriptionAdminUpdateBody = {
  mode: SubscriptionAdminMode;
  paidPlan?: 'pro' | 'studio';
  endsAt?: string;
  planTier?: string;
};

export type SubscriptionAdminSearchItem = {
  accountId: number;
  ucid: string;
  name: string;
  subscriptionPlan: string;
  channelSlug: string | null;
  subscription: AccountSubscriptionSnapshot;
};

export type SubscriptionAdminOwner = {
  userId: number;
  name: string;
};

export type SubscriptionAdminAccountDetail = SubscriptionAdminSearchItem & {
  owners: SubscriptionAdminOwner[];
};

export type SubscriptionAdminAuditPayload = {
  subscriptionPlan: string;
  subscription: AccountSubscriptionSnapshot | null;
};
