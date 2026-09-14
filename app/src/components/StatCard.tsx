import type { LucideIcon } from 'lucide-react'
import { IconTile } from '@/components/IconTile'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

type StatCardProps = {
  value: string
  label: string
  subtext?: string
  icon: LucideIcon
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'muted'
  highlight?: boolean
  className?: string
}

export function StatCard({
  value,
  label,
  subtext,
  icon,
  variant = 'muted',
  highlight = false,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden transition-colors',
        highlight && 'border-emerald-500/40 bg-emerald-500/5',
        className,
      )}
    >
      <CardHeader className="space-y-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <IconTile icon={icon} variant={variant} size="sm" />
          {highlight ? (
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
            </span>
          ) : null}
        </div>
        <div className="space-y-1">
          <CardTitle className="text-3xl font-semibold tracking-tight">
            {value}
          </CardTitle>
          <CardDescription>{label}</CardDescription>
        </div>
      </CardHeader>
      {subtext ? (
        <CardContent className="pt-0">
          <CardDescription className="line-clamp-2 text-xs">
            {subtext}
          </CardDescription>
        </CardContent>
      ) : null}
    </Card>
  )
}
