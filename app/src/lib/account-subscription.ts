import type { AuthUser } from '@/api/auth'

export function accountHasSubscriptionAccess(user: AuthUser | null | undefined): boolean {
  if (!user?.accountId) {
    return false
  }
  return user.subscription?.hasAccess === true
}

export function isTrialSubscription(user: AuthUser | null | undefined): boolean {
  return (
    user?.subscription?.planTier === 'trial' && user.subscription.hasAccess
  )
}

export function subscriptionEndsAt(user: AuthUser | null | undefined): Date | null {
  const raw = user?.subscription?.endsAt
  if (!raw) {
    return null
  }
  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function trialDaysRemaining(user: AuthUser | null | undefined): number | null {
  const endsAt = subscriptionEndsAt(user)
  if (!endsAt || !isTrialSubscription(user)) {
    return null
  }
  const ms = endsAt.getTime() - Date.now()
  if (ms <= 0) {
    return 0
  }
  return Math.ceil(ms / (24 * 60 * 60 * 1000))
}
