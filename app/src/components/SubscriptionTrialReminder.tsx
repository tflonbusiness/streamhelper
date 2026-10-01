import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import type { AuthUser } from '@/api/auth'
import { StatusAlert, type StatusAlertTone } from '@/components/StatusAlert'
import {
  accountHasSubscriptionAccess,
  isTrialSubscription,
  trialDaysRemaining,
} from '@/lib/account-subscription'
import { getTelegramSupportUrl } from '@/lib/subscription-plan'

type SubscriptionTrialReminderProps = {
  user: AuthUser | null | undefined
}

export function SubscriptionTrialReminder({ user }: SubscriptionTrialReminderProps) {
  const { t } = useTranslation()

  if (!user?.accountId || !isTrialSubscription(user)) {
    return null
  }

  const daysLeft = trialDaysRemaining(user)
  if (daysLeft === null) {
    return null
  }

  const urgent = daysLeft <= 1
  const tone: StatusAlertTone = urgent ? 'warning' : 'info'
  const title = urgent
    ? t('subscription.trialEndingSoonTitle')
    : t('subscription.trialActiveTitle')
  const body =
    daysLeft === 0
      ? t('subscription.trialLastDayBody')
      : t('subscription.trialDaysRemaining', { count: daysLeft })

  return (
    <StatusAlert tone={tone} title={title}>
      {body}
    </StatusAlert>
  )
}

type SubscriptionExpiredNoticeProps = {
  user: AuthUser | null | undefined
  variant?: 'dashboard' | 'subscription'
}

export function SubscriptionExpiredNotice({
  user,
  variant = 'dashboard',
}: SubscriptionExpiredNoticeProps) {
  const { t } = useTranslation()

  if (!user?.accountId || accountHasSubscriptionAccess(user)) {
    return null
  }

  const isSubscriptionPage = variant === 'subscription'

  return (
    <StatusAlert tone="error" title={t('subscription.trialExpiredTitle')}>
      <Stack spacing={1.5} alignItems="flex-start">
        <span>
          {isSubscriptionPage
            ? t('subscription.trialExpiredSubscriptionPageBody')
            : user.role === 'moderator'
              ? t('subscription.trialExpiredModeratorBody')
              : t('subscription.trialExpiredBody')}
        </span>
        {user.role === 'owner' && !isSubscriptionPage ? (
          <Button
            component={RouterLink}
            to="/subscription"
            size="small"
            variant="contained"
            color="error"
          >
            {t('subscription.activateSubscriptionCta')}
          </Button>
        ) : null}
        {!isSubscriptionPage && user.role !== 'owner' && user.role !== 'moderator' ? (
          <Button
            href={getTelegramSupportUrl()}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            variant="outlined"
          >
            {t('subscription.telegramCta')}
          </Button>
        ) : null}
      </Stack>
    </StatusAlert>
  )
}
