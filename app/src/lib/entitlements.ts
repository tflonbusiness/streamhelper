export type PlanTierId = 'trial' | 'pro' | 'max'

export type EntitlementLimits = {
  sessionsPerModule: number | null
  prizeSpinSectorsPerSession: number | null
  bonusBuySlotsPerSession: number | null
  moderatorMembers: number | null
}

export type EntitlementUsage = {
  sessions: {
    bonusBuy: number
    prizeSpin: number
    chatRoll: number
  }
  bonusBuySlots: number | null
  prizeSpinSectors: number | null
  moderatorMembers: number
}

export type EntitlementCompliance = 'ok' | 'over_limit'

export type EntitlementEnvelope = {
  entitlements: {
    planTier: PlanTierId
    limits: EntitlementLimits
  }
  usage: EntitlementUsage
  compliance: EntitlementCompliance
}

export function hasEntitlementEnvelope(
  value: unknown,
): value is EntitlementEnvelope {
  if (!value || typeof value !== 'object') {
    return false
  }
  return (
    'compliance' in value &&
    'entitlements' in value &&
    'usage' in value
  )
}

export function isOverLimit(envelope: EntitlementEnvelope | undefined): boolean {
  return envelope?.compliance === 'over_limit'
}

function exceedsNumericLimit(
  usage: number,
  limit: number | null | undefined,
): boolean {
  return limit !== null && limit !== undefined && usage > limit
}

/** Excess non-archived sessions in one module (usage > limit), not "at cap" (usage === limit). */
export function isModuleSessionsOverLimit(
  envelope: EntitlementEnvelope | undefined,
  module: keyof EntitlementUsage['sessions'],
): boolean {
  if (!envelope) {
    return false
  }
  return exceedsNumericLimit(
    envelope.usage.sessions[module],
    envelope.entitlements.limits.sessionsPerModule,
  )
}

/** Go live does not add a session — block only when this module has too many sessions. */
export function canGoLiveModuleSession(
  envelope: EntitlementEnvelope | undefined,
  module: keyof EntitlementUsage['sessions'],
): boolean {
  return !isModuleSessionsOverLimit(envelope, module)
}

export function canGoLiveBonusBuySession(
  envelope: EntitlementEnvelope | undefined,
): boolean {
  if (!canGoLiveModuleSession(envelope, 'bonusBuy')) {
    return false
  }
  if (!envelope) {
    return true
  }
  const limit = envelope.entitlements.limits.bonusBuySlotsPerSession
  const usage = envelope.usage.bonusBuySlots
  return !exceedsNumericLimit(usage ?? 0, limit)
}

export function canGoLivePrizeSpinSession(
  envelope: EntitlementEnvelope | undefined,
): boolean {
  if (!canGoLiveModuleSession(envelope, 'prizeSpin')) {
    return false
  }
  if (!envelope) {
    return true
  }
  const limit = envelope.entitlements.limits.prizeSpinSectorsPerSession
  const usage = envelope.usage.prizeSpinSectors
  return !exceedsNumericLimit(usage ?? 0, limit)
}

export function canGoLiveChatRollSession(
  envelope: EntitlementEnvelope | undefined,
): boolean {
  return canGoLiveModuleSession(envelope, 'chatRoll')
}

export function isAtSessionCap(
  envelope: EntitlementEnvelope | undefined,
  module: keyof EntitlementUsage['sessions'],
): boolean {
  const limit = envelope?.entitlements.limits.sessionsPerModule
  if (limit === null || limit === undefined || !envelope) {
    return false
  }
  return envelope.usage.sessions[module] >= limit
}

export function isAtBonusBuySlotCap(
  envelope: EntitlementEnvelope | undefined,
): boolean {
  const limit = envelope?.entitlements.limits.bonusBuySlotsPerSession
  const usage = envelope?.usage.bonusBuySlots
  if (
    limit === null ||
    limit === undefined ||
    usage === null ||
    usage === undefined ||
    !envelope
  ) {
    return false
  }
  return usage >= limit
}

export function isAtPrizeSpinSectorCap(
  envelope: EntitlementEnvelope | undefined,
): boolean {
  const limit = envelope?.entitlements.limits.prizeSpinSectorsPerSession
  const usage = envelope?.usage.prizeSpinSectors
  if (
    limit === null ||
    limit === undefined ||
    usage === null ||
    usage === undefined ||
    !envelope
  ) {
    return false
  }
  return usage >= limit
}

export function isAtModeratorCap(
  envelope: EntitlementEnvelope | undefined,
): boolean {
  const limit = envelope?.entitlements.limits.moderatorMembers
  if (limit === null || limit === undefined || !envelope) {
    return false
  }
  return envelope.usage.moderatorMembers >= limit
}

export function canMutateWithEntitlements(
  envelope: EntitlementEnvelope | undefined,
): boolean {
  return !isOverLimit(envelope)
}

export function pickEntitlementEnvelope<T extends object>(
  payload: T,
): { data: Omit<T, keyof EntitlementEnvelope>; envelope?: EntitlementEnvelope } {
  if (!hasEntitlementEnvelope(payload)) {
    return { data: payload }
  }
  const { entitlements, usage, compliance, ...rest } = payload as T &
    EntitlementEnvelope
  return {
    data: rest as Omit<T, keyof EntitlementEnvelope>,
    envelope: { entitlements, usage, compliance },
  }
}
