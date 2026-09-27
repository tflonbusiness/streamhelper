import type { TFunction } from 'i18next'

const DEFAULT_TELEGRAM_USERNAME = 'jirni_otec'

export function getPlanLabel(subscriptionPlan?: string, t?: TFunction): string {
  if (!subscriptionPlan || subscriptionPlan === 'free') {
    return t ? t('common.free') : 'Free'
  }
  return subscriptionPlan
}

export function isFreePlan(subscriptionPlan?: string): boolean {
  return !subscriptionPlan || subscriptionPlan === 'free'
}

export function getPlanBlurb(subscriptionPlan?: string, t?: TFunction): string {
  if (isFreePlan(subscriptionPlan)) {
    return t
      ? t('subscription.blurbFree')
      : 'Basic access to the dashboard and modules.'
  }
  return t ? t('subscription.blurbPaid') : 'Extended team capabilities.'
}

export function getPlanFeatures(
  subscriptionPlan?: string,
  t?: TFunction,
): string[] {
  if (isFreePlan(subscriptionPlan)) {
    return t
      ? [
          t('subscription.featureTeamDashboard'),
          t('subscription.featureModuleConnections'),
          t('subscription.featureKickStats'),
        ]
      : [
          'Team management dashboard',
          'Streamer module connections',
          'Kick channel statistics',
        ]
  }
  return t
    ? [
        t('subscription.featureAllFree'),
        t('subscription.featureExtended'),
        t('subscription.featurePrioritySupport'),
      ]
    : [
        'Everything in the free plan',
        'Extended limits and modules',
        'Priority support',
      ]
}

export function getTelegramSupportUsername(): string {
  const fromEnv = import.meta.env.VITE_TELEGRAM_SUPPORT_USERNAME
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return fromEnv.trim().replace(/^@/, '')
  }
  return DEFAULT_TELEGRAM_USERNAME
}

export function getTelegramSupportUrl(): string {
  return `https://t.me/${getTelegramSupportUsername()}`
}
