import Chip from '@mui/material/Chip'
import { alpha, useTheme } from '@mui/material/styles'
import { getPlanLabel, isFreePlan } from '@/lib/subscription-plan'

type PlanBadgeProps = {
  subscriptionPlan?: string
  className?: string
}

export function PlanBadge({ subscriptionPlan, className }: PlanBadgeProps) {
  const theme = useTheme()
  const free = isFreePlan(subscriptionPlan)

  return (
    <Chip
      label={getPlanLabel(subscriptionPlan)}
      size="small"
      className={className}
      sx={
        free
          ? {
              bgcolor: alpha(theme.palette.text.primary, 0.08),
              color: theme.palette.text.secondary,
            }
          : {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            }
      }
    />
  )
}
