import type { AuthUser } from '@/api/auth'
import { DashboardSubscriptionExpiredState } from '@/components/DashboardSubscriptionExpiredState'
import { SubscriptionTrialReminder } from '@/components/SubscriptionTrialReminder'
import { accountHasSubscriptionAccess } from '@/lib/account-subscription'

type DashboardSubscriptionBannerProps = {
  user: AuthUser | null | undefined
}

export function DashboardSubscriptionBanner({ user }: DashboardSubscriptionBannerProps) {
  if (!user?.accountId) {
    return null
  }

  if (!accountHasSubscriptionAccess(user)) {
    return <DashboardSubscriptionExpiredState user={user} />
  }

  return <SubscriptionTrialReminder user={user} />
}
