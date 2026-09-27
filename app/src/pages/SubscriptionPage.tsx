import { Stack } from '@mui/material'
import { useTranslation } from 'react-i18next'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import { PageHeader } from '@/components/PageHeader'
import { SubscriptionPlanCard } from '@/components/SubscriptionPlanCard'
import { TelegramActivationNotice } from '@/components/TelegramActivationNotice'
import { useAuth } from '@/context/AuthContext'

export function SubscriptionPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <Stack spacing={4}>
      <PageHeader
        title={t('subscription.title')}
        description={t('subscription.description')}
        icon={CreditCardIcon}
        iconVariant="warning"
      />

      <Stack spacing={3}>
        <SubscriptionPlanCard subscriptionPlan={user?.subscriptionPlan} />
        <TelegramActivationNotice />
      </Stack>
    </Stack>
  )
}
