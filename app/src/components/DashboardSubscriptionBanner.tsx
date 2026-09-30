import type { AuthUser } from '@/api/auth'
import {
  SubscriptionExpiredNotice,
  SubscriptionTrialReminder,
} from '@/components/SubscriptionTrialReminder'
import { accountHasSubscriptionAccess } from '@/lib/account-subscription'

type DashboardSubscriptionBannerProps = {
  user: AuthUser | null | undefined
}

export function DashboardSubscriptionBanner({ user }: DashboardSubscriptionBannerProps) {
  if (!user?.accountId) {
    return null
  }

  if (!accountHasSubscriptionAccess(user)) {
    return <SubscriptionExpiredNotice user={user} variant="dashboard" />
  }

  return <SubscriptionTrialReminder user={user} />
}
