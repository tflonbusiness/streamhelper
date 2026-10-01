import type { AccountSubscriptionSnapshot } from '../subscriptions/account-subscription-access.js';

export type SubscriptionAdminMode = 'revoked' | 'trial' | 'paid';

export type SubscriptionAdminUpdateBody = {
  mode: SubscriptionAdminMode;
  paidPlan?: 'pro' | 'max';
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

export const SUBSCRIPTION_ADMIN_SORT_FIELDS = [
  'accountId',
  'name',
  'subscriptionPlan',
  'channelSlug',
  'endsAt',
  'updatedAt',
] as const;

export type SubscriptionAdminSortField =
  (typeof SUBSCRIPTION_ADMIN_SORT_FIELDS)[number];

export type SubscriptionAdminSortOrder = 'asc' | 'desc';

export type SubscriptionAdminSearchQuery = {
  q: string;
  page: number;
  pageSize: number;
  sortBy: SubscriptionAdminSortField;
  sortOrder: SubscriptionAdminSortOrder;
};

export type SubscriptionAdminSearchResult = {
  items: SubscriptionAdminSearchItem[];
  total: number;
  page: number;
  pageSize: number;
};
