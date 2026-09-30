import type { TFunction } from 'i18next'
import type { AuthUser } from '@/api/auth'
import {
  accountHasSubscriptionAccess,
  isTrialSubscription,
  subscriptionEndsAt,
} from '@/lib/account-subscription'

export type PaidPlanId = 'pro' | 'studio'

export type SubscriptionPlanId = 'trial' | PaidPlanId | 'expired'

export type SubscriptionPlanDefinition = {
  id: SubscriptionPlanId
  nameKey: string
  blurbKey: string
  featureKeys: string[]
}

export const PAID_PLAN_IDS: PaidPlanId[] = ['pro', 'studio']

export const SUBSCRIPTION_PLAN_DEFINITIONS: Record<
  SubscriptionPlanId,
  SubscriptionPlanDefinition
> = {
  trial: {
    id: 'trial',
    nameKey: 'subscription.plans.trial.name',
    blurbKey: 'subscription.plans.trial.blurb',
    featureKeys: [
      'subscription.plans.trial.features.allModules',
      'subscription.plans.trial.features.team',
      'subscription.plans.trial.features.overlays',
    ],
  },
  pro: {
    id: 'pro',
    nameKey: 'subscription.plans.pro.name',
    blurbKey: 'subscription.plans.pro.blurb',
    featureKeys: [
      'subscription.plans.pro.features.allModules',
      'subscription.plans.pro.features.limits',
      'subscription.plans.pro.features.support',
    ],
  },
  studio: {
    id: 'studio',
    nameKey: 'subscription.plans.studio.name',
    blurbKey: 'subscription.plans.studio.blurb',
    featureKeys: [
      'subscription.plans.studio.features.allPro',
      'subscription.plans.studio.features.priority',
      'subscription.plans.studio.features.custom',
    ],
  },
  expired: {
    id: 'expired',
    nameKey: 'subscription.plans.expired.name',
    blurbKey: 'subscription.plans.expired.blurb',
    featureKeys: [
      'subscription.plans.expired.features.dashboardOnly',
      'subscription.plans.expired.features.modulesPaused',
    ],
  },
}

export function resolveCurrentSubscriptionPlanId(
  user: AuthUser | null | undefined,
): SubscriptionPlanId {
  if (!user?.accountId) {
    return 'expired'
  }

  if (!accountHasSubscriptionAccess(user)) {
    return 'expired'
  }

  if (isTrialSubscription(user)) {
    return 'trial'
  }

  const plan = user.subscriptionPlan?.trim().toLowerCase()
  if (plan === 'studio') {
    return 'studio'
  }
  if (plan === 'pro' || plan === 'full') {
    return 'pro'
  }

  return 'pro'
}

export function resolveAlternativePlanIds(
  current: SubscriptionPlanId,
): PaidPlanId[] {
  if (current === 'studio') {
    return []
  }
  if (current === 'pro') {
    return ['studio']
  }
  return PAID_PLAN_IDS
}

export function getPlanDefinition(
  planId: SubscriptionPlanId,
): SubscriptionPlanDefinition {
  return SUBSCRIPTION_PLAN_DEFINITIONS[planId]
}

export function translatePlanFeatures(
  planId: SubscriptionPlanId,
  t: TFunction,
): string[] {
  return getPlanDefinition(planId).featureKeys.map((key) => t(key))
}

export function formatSubscriptionEndsAt(
  user: AuthUser | null | undefined,
  locale: string,
): string | null {
  const endsAt = subscriptionEndsAt(user)
  if (!endsAt) {
    return null
  }
  return endsAt.toLocaleString(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
