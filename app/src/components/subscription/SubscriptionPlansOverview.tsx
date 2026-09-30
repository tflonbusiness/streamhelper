import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import type { AuthUser } from '@/api/auth'
import { SubscriptionPlanOfferingCard } from '@/components/subscription/SubscriptionPlanOfferingCard'
import {
  formatSubscriptionEndsAt,
  resolveAlternativePlanIds,
  resolveCurrentSubscriptionPlanId,
} from '@/lib/subscription-catalog'

type SubscriptionPlansOverviewProps = {
  user: AuthUser | null | undefined
}

export function SubscriptionPlansOverview({ user }: SubscriptionPlansOverviewProps) {
  const { t, i18n } = useTranslation()
  const currentPlanId = resolveCurrentSubscriptionPlanId(user)
  const alternatives = resolveAlternativePlanIds(currentPlanId)
  const endsAtLabel =
    currentPlanId === 'trial'
      ? formatSubscriptionEndsAt(user, i18n.language)
      : null

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.8 }}>
          {t('subscription.currentPlanSection')}
        </Typography>
        <Box sx={{ mt: 1.5 }}>
          <SubscriptionPlanOfferingCard
            planId={currentPlanId}
            variant="current"
            endsAtLabel={endsAtLabel}
          />
        </Box>
      </Box>

      {alternatives.length > 0 ? (
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.8 }}>
            {t('subscription.alternativesSection')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
            {t('subscription.alternativesHint')}
          </Typography>
          <Grid container spacing={2}>
            {alternatives.map((planId) => (
              <Grid key={planId} size={{ xs: 12, md: 6 }}>
                <SubscriptionPlanOfferingCard planId={planId} variant="alternative" />
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : null}
    </Stack>
  )
}
