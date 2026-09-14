import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const variantStyles = {
  primary: 'bg-primary/15 text-primary',
  success: 'bg-emerald-500/15 text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-400',
  danger: 'bg-red-500/15 text-red-400',
  info: 'bg-sky-500/15 text-sky-400',
  purple: 'bg-purple-500/15 text-purple-400',
  muted: 'bg-muted text-muted-foreground',
} as const

type IconTileVariant = keyof typeof variantStyles

type IconTileProps = {
  icon: LucideIcon
  variant?: IconTileVariant
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: { box: 'size-8', icon: 'size-4' },
  md: { box: 'size-10', icon: 'size-5' },
  lg: { box: 'size-12', icon: 'size-6' },
} as const

export function IconTile({
  icon: Icon,
  variant = 'primary',
  size = 'md',
  className,
}: IconTileProps) {
  const sizes = sizeStyles[size]

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg',
        sizes.box,
        variantStyles[variant],
        className,
      )}
    >
      <Icon className={sizes.icon} aria-hidden />
    </div>
  )
}
