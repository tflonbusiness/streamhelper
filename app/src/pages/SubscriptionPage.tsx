import { CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { SubscriptionPlanCard } from '@/components/SubscriptionPlanCard'
import { TelegramActivationNotice } from '@/components/TelegramActivationNotice'
import { useAuth } from '@/context/AuthContext'

export function SubscriptionPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Subscription"
        description="Your team's plan and features"
        icon={CreditCard}
        iconVariant="warning"
      />

      <div className="flex flex-col gap-6">
        <SubscriptionPlanCard subscriptionPlan={user?.subscriptionPlan} />
        <TelegramActivationNotice />
      </div>
    </div>
  )
}
