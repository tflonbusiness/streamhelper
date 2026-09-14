import { CardDescription, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type BrandHeaderProps = {
  title?: string
  description?: string
  compact?: boolean
  className?: string
}

export function BrandHeader({
  title = 'Caz Agent',
  description,
  compact = false,
  className,
}: BrandHeaderProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 text-center', className)}>
      <img
        src="/logo.svg"
        alt="Caz Agent"
        className={cn('shrink-0', compact ? 'h-8 w-8' : 'h-12 w-12')}
      />
      <div className="space-y-1.5">
        <CardTitle className={cn(compact && 'text-xl')}>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </div>
    </div>
  )
}
