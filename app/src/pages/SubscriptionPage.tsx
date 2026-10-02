import { Stack } from '@mui/material'
import { useTranslation } from 'react-i18next'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import { PageHeader } from '@/components/PageHeader'
import { SubscriptionPlansOverview } from '@/components/subscription/SubscriptionPlansOverview'
import { SubscriptionTrialReminder } from '@/components/SubscriptionTrialReminder'
import { TelegramActivationNotice } from '@/components/TelegramActivationNotice'
import { useAuth } from '@/context/AuthContext'
import { accountHasSubscriptionAccess } from '@/lib/account-subscription'

export function SubscriptionPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const hasAccess = accountHasSubscriptionAccess(user)

  return (
    <Stack spacing={4}>
      <PageHeader
        title={t('subscription.title')}
        description={
          hasAccess
            ? t('subscription.description')
            : t('subscription.descriptionExpired')
        }
        icon={CreditCardIcon}
        iconVariant="warning"
      />

      <Stack spacing={3}>
        <TelegramActivationNotice />

        {hasAccess ? <SubscriptionTrialReminder user={user} /> : null}

        <SubscriptionPlansOverview user={user} />
      </Stack>
    </Stack>
  )
}
