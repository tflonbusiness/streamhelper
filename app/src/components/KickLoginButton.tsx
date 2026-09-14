import Button from '@mui/material/Button'
import { kickLoginUrl } from '@/api/auth'

function KickLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ width: 24, height: 24, flexShrink: 0 }}
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
      component="a"
      href={kickLoginUrl()}
      className={className}
      size="large"
      fullWidth
      sx={{
        height: 48,
        gap: 1.5,
        bgcolor: '#53FC18',
        color: '#0e0e10',
        fontSize: '1rem',
        fontWeight: 600,
        boxShadow: 1,
        '&:hover': {
          bgcolor: '#47e014',
        },
      }}
    >
      <KickLogo />
      <span>Sign in with Kick</span>
    </Button>
  )
}
