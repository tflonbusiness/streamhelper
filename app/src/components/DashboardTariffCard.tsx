import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import type { AuthUser } from '@/api/auth'
import {
  formatSubscriptionEndsAt,
  getPlanDefinition,
  resolveCurrentSubscriptionPlanId,
} from '@/lib/subscription-catalog'

type DashboardTariffCardProps = {
  user: AuthUser
}

export function DashboardTariffCard({ user }: DashboardTariffCardProps) {
  const { t, i18n } = useTranslation()
  const planId = resolveCurrentSubscriptionPlanId(user)
  const planName = t(getPlanDefinition(planId).nameKey)
  const endsAtLabel = formatSubscriptionEndsAt(user, i18n.language)

  return (
    <>
      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.35 }}>
        {planName}
      </Typography>
      {endsAtLabel ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, lineHeight: 1.45 }}>
          {t('subscription.planValidUntil', { date: endsAtLabel })}
        </Typography>
      ) : null}
    </>
  )
}
