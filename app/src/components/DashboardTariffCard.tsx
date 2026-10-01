import { SubscriptionPlanCard } from '@/components/SubscriptionPlanCard'

type DashboardTariffCardProps = {
  subscriptionPlan?: string
}

export function DashboardTariffCard({ subscriptionPlan }: DashboardTariffCardProps) {
  return (
    <SubscriptionPlanCard
      subscriptionPlan={subscriptionPlan}
      variant="compact"
      sx={{ height: '100%' }}
    />
  )
}
