export type PlanTierId = 'trial' | 'pro' | 'max';

export type EntitlementLimits = {
  sessionsPerModule: number | null;
  prizeSpinSectorsPerSession: number | null;
  bonusBuySlotsPerSession: number | null;
  moderatorMembers: number | null;
};

export type EntitlementUsage = {
  sessions: {
    bonusBuy: number;
    prizeSpin: number;
    chatRoll: number;
  };
  bonusBuySlots: number | null;
  prizeSpinSectors: number | null;
  moderatorMembers: number;
};

export type EntitlementCompliance = 'ok' | 'over_limit';

export type EntitlementModuleId = keyof EntitlementUsage['sessions'];

export type EntitlementComplianceScope =
  | { kind: 'account' }
  | { kind: 'module'; module: EntitlementModuleId }
  | { kind: 'team' };

export type EntitlementEnvelope = {
  entitlements: {
    planTier: PlanTierId;
    limits: EntitlementLimits;
  };
  usage: EntitlementUsage;
  compliance: EntitlementCompliance;
};

export const PLAN_ENTITLEMENTS: Record<PlanTierId, EntitlementLimits> = {
  trial: {
    sessionsPerModule: 2,
    prizeSpinSectorsPerSession: 10,
    bonusBuySlotsPerSession: 20,
    moderatorMembers: 1,
  },
  pro: {
    sessionsPerModule: 5,
    prizeSpinSectorsPerSession: 20,
    bonusBuySlotsPerSession: 40,
    moderatorMembers: 2,
  },
  max: {
    sessionsPerModule: null,
    prizeSpinSectorsPerSession: null,
    bonusBuySlotsPerSession: null,
    moderatorMembers: null,
  },
};

export function normalizePlanTier(raw: string | null | undefined): PlanTierId {
  if (raw === 'pro' || raw === 'max') {
    return raw;
  }
  return 'trial';
}

function exceedsLimit(usage: number, limit: number | null): boolean {
  return limit !== null && usage > limit;
}

export function evaluateEntitlementCompliance(
  limits: EntitlementLimits,
  usage: EntitlementUsage,
): EntitlementCompliance {
  if (
    exceedsLimit(usage.sessions.bonusBuy, limits.sessionsPerModule) ||
    exceedsLimit(usage.sessions.prizeSpin, limits.sessionsPerModule) ||
    exceedsLimit(usage.sessions.chatRoll, limits.sessionsPerModule) ||
    exceedsLimit(usage.moderatorMembers, limits.moderatorMembers)
  ) {
    return 'over_limit';
  }

  if (
    usage.bonusBuySlots !== null &&
    exceedsLimit(usage.bonusBuySlots, limits.bonusBuySlotsPerSession)
  ) {
    return 'over_limit';
  }

  if (
    usage.prizeSpinSectors !== null &&
    exceedsLimit(usage.prizeSpinSectors, limits.prizeSpinSectorsPerSession)
  ) {
    return 'over_limit';
  }

  return 'ok';
}

export function evaluateEntitlementComplianceForScope(
  limits: EntitlementLimits,
  usage: EntitlementUsage,
  scope: EntitlementComplianceScope,
): EntitlementCompliance {
  if (scope.kind === 'account') {
    return evaluateEntitlementCompliance(limits, usage);
  }

  if (scope.kind === 'team') {
    return exceedsLimit(usage.moderatorMembers, limits.moderatorMembers)
      ? 'over_limit'
      : 'ok';
  }

  const { module } = scope;
  if (exceedsLimit(usage.sessions[module], limits.sessionsPerModule)) {
    return 'over_limit';
  }

  if (
    module === 'bonusBuy' &&
    usage.bonusBuySlots !== null &&
    exceedsLimit(usage.bonusBuySlots, limits.bonusBuySlotsPerSession)
  ) {
    return 'over_limit';
  }

  if (
    module === 'prizeSpin' &&
    usage.prizeSpinSectors !== null &&
    exceedsLimit(usage.prizeSpinSectors, limits.prizeSpinSectorsPerSession)
  ) {
    return 'over_limit';
  }

  return 'ok';
}

export function buildEntitlementEnvelope(
  planTier: PlanTierId,
  usage: EntitlementUsage,
  scope: EntitlementComplianceScope = { kind: 'account' },
): EntitlementEnvelope {
  const limits = PLAN_ENTITLEMENTS[planTier];
  return {
    entitlements: { planTier, limits },
    usage,
    compliance: evaluateEntitlementComplianceForScope(limits, usage, scope),
  };
}

export function isAtSessionModuleCap(
  envelope: EntitlementEnvelope,
  module: keyof EntitlementUsage['sessions'],
): boolean {
  const limit = envelope.entitlements.limits.sessionsPerModule;
  if (limit === null) {
    return false;
  }
  return envelope.usage.sessions[module] >= limit;
}
