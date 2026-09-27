import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import { kickLoginUrl } from '@/api/auth'

type KickLoginButtonProps = {
  className?: string
}

export function KickLoginButton({ className }: KickLoginButtonProps) {
  const { t } = useTranslation()

  return (
    <Button
      component="a"
      href={kickLoginUrl()}
      className={className}
      size="large"
      fullWidth
      sx={{
        height: 52,
        gap: 1.25,
        px: 2.5,
        borderRadius: 3,
        bgcolor: '#53FC18',
        color: '#0e0e10',
        fontSize: '1rem',
        fontWeight: 700,
        letterSpacing: '-0.01em',
        textTransform: 'none',
        boxShadow: '0 4px 20px rgba(83, 252, 24, 0.35)',
        transition: 'background-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease',
        '&:hover': {
          bgcolor: '#47e014',
          boxShadow: '0 6px 24px rgba(83, 252, 24, 0.45)',
        },
        '&:active': {
          transform: 'translateY(1px)',
        },
        '&:focus-visible': {
          outline: '2px solid #53FC18',
          outlineOffset: 3,
        },
      }}
    >
      <Box
        component="img"
        src="/kick-logo-24.png"
        alt=""
        aria-hidden
        sx={{ width: 20.55, height: 25, flexShrink: 0 }}
      />
      <span>{t('common.signInWithKick')}</span>
    </Button>
  )
}
