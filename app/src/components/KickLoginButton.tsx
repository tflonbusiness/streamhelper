import { kickLoginUrl } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function KickLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn('shrink-0', className)}
    >
      <path
        fill="currentColor"
        d="M1.333 0 0 3.894v16.212h3.11V24l3.89-3.89h7.67L24 12.024V0H1.333zm19.24 10.753-2.89 2.89H8.72l-2.89 2.89V3.894h14.543v6.859z"
      />
    </svg>
  )
}

type KickLoginButtonProps = {
  className?: string
}

export function KickLoginButton({ className }: KickLoginButtonProps) {
  return (
    <Button
      asChild
      size="lg"
      className={cn(
        'h-12 w-full gap-3 bg-[#53FC18] text-base font-semibold text-[#0e0e10] shadow-sm hover:bg-[#47e014] focus-visible:ring-[#53FC18] [&_svg]:size-6',
        className,
      )}
    >
      <a href={kickLoginUrl()}>
        <KickLogo />
        <span>Sign in with Kick</span>
      </a>
    </Button>
  )
}
