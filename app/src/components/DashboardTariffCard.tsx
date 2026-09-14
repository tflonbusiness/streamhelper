import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SubscriptionPlanCard } from '@/components/SubscriptionPlanCard'
import { Button } from '@/components/ui/button'

type DashboardTariffCardProps = {
  subscriptionPlan?: string
  showSubscriptionLink: boolean
}

export function DashboardTariffCard({
  subscriptionPlan,
  showSubscriptionLink,
}: DashboardTariffCardProps) {
  return (
    <SubscriptionPlanCard
      subscriptionPlan={subscriptionPlan}
      variant="compact"
      footer={
        showSubscriptionLink ? (
          <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
            <Link to="/subscription">
              Manage subscription
              <ArrowRight className="ml-2 size-4" aria-hidden />
            </Link>
          </Button>
        ) : undefined
      }
    />
  )
}
