import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import { alpha, useTheme, type SxProps, type Theme } from '@mui/material/styles'
import CheckIcon from '@mui/icons-material/Check'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { PlanBadge } from '@/components/PlanBadge'
import { getPlanFeatures, isFreePlan } from '@/lib/subscription-plan'
import { cardSx } from '@/theme/colors'

type SubscriptionPlanCardProps = {
  subscriptionPlan?: string
  variant?: 'compact' | 'full'
  footer?: ReactNode
  className?: string
  sx?: SxProps<Theme>
}

export function SubscriptionPlanCard({
  subscriptionPlan,
  variant = 'full',
  footer,
  className,
  sx,
}: SubscriptionPlanCardProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const free = isFreePlan(subscriptionPlan)
  const features = getPlanFeatures(subscriptionPlan, t)
  const compact = variant === 'compact'

  return (
    <Card
      className={className}
      sx={[
        cardSx,
        {
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: 4,
          borderLeftStyle: 'solid',
          borderLeftColor: free
            ? alpha(theme.palette.text.secondary, 0.4)
            : theme.palette.primary.main,
          background: compact
            ? `linear-gradient(160deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${theme.palette.background.paper} 50%)`
            : undefined,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <CardContent sx={{ pb: compact ? 1.5 : 2, flex: compact ? 1 : undefined }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              width: 40,
              height: 40,
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
              bgcolor: free
                ? alpha(theme.palette.text.primary, 0.08)
                : alpha(theme.palette.primary.main, 0.1),
              color: free ? theme.palette.text.secondary : theme.palette.primary.main,
            }}
          >
            <CreditCardIcon sx={{ fontSize: 20 }} aria-hidden />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" component="h3">
                {compact ? t('dashboard.planTitle') : t('dashboard.currentPlan')}
              </Typography>
              <PlanBadge subscriptionPlan={subscriptionPlan} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {compact
                ? t('dashboard.planBlurbCompact')
                : t('dashboard.planBlurbFull')}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      {!compact ? (
        <CardContent sx={{ pt: 0 }}>
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {features.map((feature) => (
              <Box
                component="li"
                key={feature}
                sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}
              >
                <CheckIcon
                  sx={{
                    fontSize: 16,
                    mt: 0.25,
                    flexShrink: 0,
                    color: theme.palette.primary.main,
                  }}
                  aria-hidden
                />
                <Typography variant="body2" color="text.secondary">
                  {feature}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      ) : null}

      {footer ? (
        <CardActions sx={{ borderTop: 1, borderColor: 'divider', pt: 2, px: 2, pb: 2 }}>
          {footer}
        </CardActions>
      ) : null}
    </Card>
  )
}
