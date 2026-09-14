const DEFAULT_TELEGRAM_USERNAME = 'jirni_otec'

export function getPlanLabel(subscriptionPlan?: string): string {
  if (!subscriptionPlan || subscriptionPlan === 'free') {
    return 'Free'
  }
  return subscriptionPlan
}

export function isFreePlan(subscriptionPlan?: string): boolean {
  return !subscriptionPlan || subscriptionPlan === 'free'
}

export function getPlanBlurb(subscriptionPlan?: string): string {
  if (isFreePlan(subscriptionPlan)) {
    return 'Basic access to the dashboard and modules.'
  }
  return 'Extended team capabilities.'
}

export function getPlanFeatures(subscriptionPlan?: string): string[] {
  if (isFreePlan(subscriptionPlan)) {
    return [
      'Team management dashboard',
      'Streamer module connections',
      'Kick channel statistics',
    ]
  }
  return [
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
