import { Check, CreditCard } from 'lucide-react'
import type { ReactNode } from 'react'
import { PlanBadge } from '@/components/PlanBadge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getPlanFeatures, isFreePlan } from '@/lib/subscription-plan'

type SubscriptionPlanCardProps = {
  subscriptionPlan?: string
  variant?: 'compact' | 'full'
  footer?: ReactNode
  className?: string
}

export function SubscriptionPlanCard({
  subscriptionPlan,
  variant = 'full',
  footer,
  className,
}: SubscriptionPlanCardProps) {
  const free = isFreePlan(subscriptionPlan)
  const features = getPlanFeatures(subscriptionPlan)
  const compact = variant === 'compact'

  return (
    <Card
      className={cn(
        'overflow-hidden border-l-4',
        free ? 'border-l-muted-foreground/40' : 'border-l-primary',
        className,
      )}
    >
      <CardHeader className={cn(compact ? 'pb-3' : 'pb-4')}>
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-lg',
              free ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary',
            )}
          >
            <CreditCard className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">
                {compact ? 'Plan' : 'Current plan'}
              </CardTitle>
              <PlanBadge subscriptionPlan={subscriptionPlan} />
            </div>
            <CardDescription>
              {compact
                ? "Your team's current subscription plan"
                : "Your team's subscription plan"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {!compact ? (
        <CardContent>
          <ul className="space-y-2">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <Check
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      ) : null}

      {footer ? <CardFooter className="border-t pt-4">{footer}</CardFooter> : null}
    </Card>
  )
}
