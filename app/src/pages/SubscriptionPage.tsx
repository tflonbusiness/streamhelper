import { Stack } from '@mui/material'
import { CreditCard } from 'lucide-react'
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
        icon={CreditCard}
        iconVariant="warning"
      />

      <Stack spacing={3}>
        <SubscriptionPlanCard subscriptionPlan={user?.subscriptionPlan} />
        <TelegramActivationNotice />
      </Stack>
    </Stack>
  )
}
