import { cn } from '@/lib/utils'

type PageShellProps = {
  children: React.ReactNode
  wide?: boolean
  className?: string
}

export function PageShell({ children, wide = false, className }: PageShellProps) {
  return (
    <main
      className={cn(
        'flex min-h-svh items-center justify-center p-4 sm:p-6',
        className,
      )}
    >
      <div className={cn('w-full', wide ? 'max-w-xl' : 'max-w-md')}>
        {children}
      </div>
    </main>
  )
}
