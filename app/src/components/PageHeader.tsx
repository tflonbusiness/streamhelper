import type { LucideIcon } from 'lucide-react'
import { IconTile } from '@/components/IconTile'
import { CardDescription, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ModuleIconVariant } from '@/lib/modules'

type PageHeaderProps = {
  title: string
  description?: string
  icon?: LucideIcon
  iconVariant?: ModuleIconVariant
  action?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  icon,
  iconVariant = 'primary',
  action,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('space-y-1.5', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? <IconTile icon={icon} variant={iconVariant} /> : null}
          <div className="min-w-0 space-y-1.5">
            <CardTitle>{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  )
}

type SectionHeaderProps = {
  title: string
  description?: string
  className?: string
}

export function SectionHeader({
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <header className={cn('space-y-1', className)}>
      <CardTitle className="text-lg">{title}</CardTitle>
      {description ? (
        <CardDescription className="text-xs">{description}</CardDescription>
      ) : null}
    </header>
  )
}
