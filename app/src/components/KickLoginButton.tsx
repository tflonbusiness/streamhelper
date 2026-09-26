import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { kickLoginUrl } from '@/api/auth'

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
      <Box
        component="img"
        src="/kick-logo-24.png"
        alt=""
        aria-hidden
        sx={{ width: 24, height: 24, flexShrink: 0 }}
      />
      <span>Sign in with Kick</span>
    </Button>
  )
}
