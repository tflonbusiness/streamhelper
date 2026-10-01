import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import { useTranslation } from 'react-i18next'
import type { AuthUser } from '@/api/auth'
import { IconTile } from '@/components/IconTile'
import {
  formatSubscriptionEndsAt,
  getPlanDefinition,
  resolveCurrentSubscriptionPlanId,
} from '@/lib/subscription-catalog'

type DashboardTariffCardProps = {
  user: AuthUser
}

/** Compact subscription row for the team card (not a standalone section). */
export function DashboardTariffCard({ user }: DashboardTariffCardProps) {
  const { t, i18n } = useTranslation()
  const planId = resolveCurrentSubscriptionPlanId(user)
  const planName = t(getPlanDefinition(planId).nameKey)
  const endsAtLabel = formatSubscriptionEndsAt(user, i18n.language)

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        pt: 2,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <IconTile icon={CreditCardIcon} variant="primary" size="sm" />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
          {planName}
        </Typography>
        {endsAtLabel ? (
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
            {t('subscription.planValidUntil', { date: endsAtLabel })}
          </Typography>
        ) : null}
      </Box>
    </Box>
  )
}
