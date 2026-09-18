import { Stack } from '@mui/material'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import { PageHeader } from '@/components/PageHeader'
import { SubscriptionPlanCard } from '@/components/SubscriptionPlanCard'
import { TelegramActivationNotice } from '@/components/TelegramActivationNotice'
import { useAuth } from '@/context/AuthContext'

export function SubscriptionPage() {
  const { user } = useAuth()

  return (
    <Stack spacing={4}>
      <PageHeader
        title="Subscription"
        description="Your team's plan and features"
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
