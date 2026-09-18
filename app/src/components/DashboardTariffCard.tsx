import Button from '@mui/material/Button'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
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
            endIcon={<ArrowForwardIcon fontSize="small" aria-hidden />}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Manage subscription
          </Button>
        ) : undefined
      }
    />
  )
}
