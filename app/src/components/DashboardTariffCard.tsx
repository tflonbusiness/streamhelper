import Button from '@mui/material/Button'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

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
            {t('dashboard.manageSubscription')}
          </Button>
        ) : undefined
      }
    />
  )
}
