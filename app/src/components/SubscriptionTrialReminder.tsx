import { useTranslation } from 'react-i18next'
import type { AuthUser } from '@/api/auth'
import { StatusAlert, type StatusAlertTone } from '@/components/StatusAlert'
import {
  accountHasSubscriptionAccess,
  isTrialSubscription,
  subscriptionDaysRemaining,
} from '@/lib/account-subscription'
import {
  getPlanDefinition,
  resolveCurrentSubscriptionPlanId,
} from '@/lib/subscription-catalog'
const SUBSCRIPTION_ENDING_SOON_DAYS = 3

export function subscriptionEndingSoonTone(
  daysLeft: number,
): StatusAlertTone {
  if (daysLeft <= 1) {
    return 'error'
  }
  if (daysLeft === 2) {
    return 'warning'
  }
  return 'info'
}

type SubscriptionTrialReminderProps = {
  user: AuthUser | null | undefined
}

export function SubscriptionTrialReminder({ user }: SubscriptionTrialReminderProps) {
  const { t } = useTranslation()

  if (!user?.accountId || !accountHasSubscriptionAccess(user)) {
    return null
  }

  const daysLeft = subscriptionDaysRemaining(user)
  if (daysLeft === null || daysLeft > SUBSCRIPTION_ENDING_SOON_DAYS) {
    return null
  }

  const tone = subscriptionEndingSoonTone(daysLeft)
  const isTrial = isTrialSubscription(user)
  const planName = t(
    getPlanDefinition(resolveCurrentSubscriptionPlanId(user)).nameKey,
  )
  const endingSoon = daysLeft <= 2
  const title = isTrial
    ? endingSoon
      ? t('subscription.trialEndingSoonTitle')
      : t('subscription.trialActiveTitle')
    : endingSoon
      ? t('subscription.planEndingSoonTitle')
      : t('subscription.planActiveEndingTitle')
  const body = isTrial
    ? daysLeft === 0
      ? t('subscription.trialLastDayBody')
      : t('subscription.trialDaysRemaining', { count: daysLeft })
    : daysLeft === 0
      ? t('subscription.planLastDayBody', { plan: planName })
      : t('subscription.planDaysRemaining', { count: daysLeft, plan: planName })

  return (
    <StatusAlert tone={tone} title={title}>
      {body}
    </StatusAlert>
  )
}

