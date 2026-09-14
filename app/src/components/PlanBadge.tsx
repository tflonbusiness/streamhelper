import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getPlanLabel, isFreePlan } from '@/lib/subscription-plan'

type PlanBadgeProps = {
  subscriptionPlan?: string
  className?: string
}

export function PlanBadge({ subscriptionPlan, className }: PlanBadgeProps) {
  const free = isFreePlan(subscriptionPlan)

  return (
    <Badge
      variant="secondary"
      className={cn(
        free
          ? 'border-transparent bg-muted text-muted-foreground'
          : 'border-primary/30 bg-primary/10 text-primary',
        className,
      )}
    >
      {getPlanLabel(subscriptionPlan)}
    </Badge>
  )
}
