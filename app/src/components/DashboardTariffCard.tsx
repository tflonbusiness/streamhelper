import Button from '@mui/material/Button'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SubscriptionPlanCard } from '@/components/SubscriptionPlanCard'

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
          <Button
            component={Link}
            to="/subscription"
            variant="outlined"
            size="small"
            endIcon={<ArrowRight size={16} aria-hidden />}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Manage subscription
          </Button>
        ) : undefined
      }
    />
  )
}
