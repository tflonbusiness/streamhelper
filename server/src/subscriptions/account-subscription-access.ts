export type AccountSubscriptionStatus = 'active' | 'expired' | 'cancelled';

export type AccountSubscriptionRow = {
  status: AccountSubscriptionStatus;
  planTier: string;
  startsAt: Date;
  endsAt: Date;
  purchasePrice: string | null;
};

export type AccountSubscriptionSnapshot = {
  status: AccountSubscriptionStatus;
  planTier: string;
  endsAt: string;
  hasAccess: boolean;
  purchasePrice: string | null;
};

export function resolveAccountSubscriptionAccess(
  row: AccountSubscriptionRow | null,
  now: Date = new Date(),
): AccountSubscriptionSnapshot {
  if (!row) {
    return {
      status: 'expired',
      planTier: 'trial',
      endsAt: now.toISOString(),
      hasAccess: false,
      purchasePrice: null,
    };
  }

  const hasAccess = row.status === 'active' && row.endsAt > now;
  return {
    status: hasAccess ? row.status : 'expired',
    planTier: row.planTier,
    endsAt: row.endsAt.toISOString(),
    hasAccess,
    purchasePrice: row.purchasePrice,
  };
}

export function shouldMarkSubscriptionExpired(
  row: AccountSubscriptionRow,
  now: Date = new Date(),
): boolean {
  return row.status === 'active' && row.endsAt <= now;
}
