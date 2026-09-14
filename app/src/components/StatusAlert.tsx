import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  Info,
  type LucideIcon,
} from 'lucide-react'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { cn } from '@/lib/utils'

export type StatusAlertTone = 'success' | 'info' | 'warning' | 'error'

type StatusAlertProps = {
  tone: StatusAlertTone
  title?: string
  children: React.ReactNode
  className?: string
}

const toneConfig: Record<
  StatusAlertTone,
  {
    variant: 'success' | 'info' | 'warning' | 'destructive'
    icon: LucideIcon
  }
> = {
  success: { variant: 'success', icon: CheckCircle2 },
  info: { variant: 'info', icon: Info },
  warning: { variant: 'warning', icon: AlertTriangle },
  error: { variant: 'destructive', icon: CircleAlert },
}

export function StatusAlert({
  tone,
  title,
  children,
  className,
}: StatusAlertProps) {
  const { variant, icon: Icon } = toneConfig[tone]

  return (
    <Alert variant={variant} className={cn('py-4', className)}>
      <Icon aria-hidden />
      <div className="min-w-0 flex-1">
        {title ? (
          <>
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              {children}
            </AlertDescription>
          </>
        ) : (
          <AlertDescription className="font-semibold">{children}</AlertDescription>
        )}
      </div>
    </Alert>
  )
}
