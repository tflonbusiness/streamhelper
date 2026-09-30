export type AccountSubscriptionKind = 'trial' | 'paid';
export type AccountSubscriptionStatus = 'active' | 'expired' | 'cancelled';

export type AccountSubscriptionRow = {
  kind: AccountSubscriptionKind;
  status: AccountSubscriptionStatus;
  planTier: string;
  startsAt: Date;
  endsAt: Date;
};

export type AccountSubscriptionSnapshot = {
  kind: AccountSubscriptionKind;
  status: AccountSubscriptionStatus;
  planTier: string;
  endsAt: string;
  hasAccess: boolean;
};

export function resolveAccountSubscriptionAccess(
  row: AccountSubscriptionRow | null,
  now: Date = new Date(),
): AccountSubscriptionSnapshot {
  if (!row) {
    return {
      kind: 'trial',
      status: 'expired',
      planTier: 'full',
      endsAt: now.toISOString(),
      hasAccess: false,
    };
  }

  const hasAccess = row.status === 'active' && row.endsAt > now;
  return {
    kind: row.kind,
    status: hasAccess ? row.status : 'expired',
    planTier: row.planTier,
    endsAt: row.endsAt.toISOString(),
    hasAccess,
  };
}

export function shouldMarkSubscriptionExpired(
  row: AccountSubscriptionRow,
  now: Date = new Date(),
): boolean {
  return row.status === 'active' && row.endsAt <= now;
}
