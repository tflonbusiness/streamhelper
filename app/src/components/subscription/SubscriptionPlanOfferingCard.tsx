import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckIcon from '@mui/icons-material/Check'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { alpha, useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import type { SubscriptionPlanId } from '@/lib/subscription-catalog'
import {
  getPlanDefinition,
  translatePlanFeatures,
} from '@/lib/subscription-catalog'
import { getTelegramSupportUrl } from '@/lib/subscription-plan'

type SubscriptionPlanOfferingCardProps = {
  planId: SubscriptionPlanId
  variant: 'current' | 'alternative'
  endsAtLabel?: string | null
}

export function SubscriptionPlanOfferingCard({
  planId,
  variant,
  endsAtLabel,
}: SubscriptionPlanOfferingCardProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const definition = getPlanDefinition(planId)
  const features = translatePlanFeatures(planId, t)
  const isCurrent = variant === 'current'
  const isExpired = planId === 'expired'
  const accent = isExpired
    ? theme.palette.error.main
    : planId === 'studio'
      ? theme.palette.secondary.main
      : theme.palette.primary.main

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: 2,
        borderColor: isCurrent ? accent : 'divider',
        bgcolor: isCurrent ? alpha(accent, 0.04) : 'background.paper',
        boxShadow: isCurrent ? `0 0 0 1px ${alpha(accent, 0.15)}` : 'none',
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Stack spacing={1}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h6" component="h3">
              {t(definition.nameKey)}
            </Typography>
            {isCurrent ? (
              <Chip
                size="small"
                label={t('subscription.planCurrentBadge')}
                sx={{
                  bgcolor: alpha(accent, 0.12),
                  color: accent,
                  fontWeight: 600,
                }}
              />
            ) : null}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {t(definition.blurbKey)}
          </Typography>
          {isCurrent && endsAtLabel ? (
            <Typography variant="caption" color="text.secondary">
              {t('subscription.planValidUntil', { date: endsAtLabel })}
            </Typography>
          ) : null}
        </Stack>

        <Box
          component="ul"
          sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1 }}
        >
          {features.map((feature) => (
            <Box
              component="li"
              key={feature}
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}
            >
              <CheckIcon
                sx={{
                  fontSize: 18,
                  mt: 0.2,
                  flexShrink: 0,
                  color: isExpired ? theme.palette.text.disabled : accent,
                }}
                aria-hidden
              />
              <Typography variant="body2" color="text.secondary">
                {feature}
              </Typography>
            </Box>
          ))}
        </Box>

        {variant === 'alternative' ? (
          <Button
            component="a"
            href={getTelegramSupportUrl()}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            size="small"
            endIcon={<OpenInNewIcon fontSize="small" aria-hidden />}
            sx={{ alignSelf: 'flex-start', mt: 'auto' }}
          >
            {t('subscription.planUpgradeCta', {
              plan: t(definition.nameKey),
            })}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
