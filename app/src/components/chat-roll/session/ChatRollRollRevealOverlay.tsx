import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  Typography,
} from '@mui/material'
import { keyframes, styled } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ChatRollWin } from '@/api/chat-roll'

const glow = keyframes`
  0%, 100% { text-shadow: 0 0 20px rgba(255, 183, 77, 0.35); }
  50% { text-shadow: 0 0 40px rgba(255, 183, 77, 0.75); }
`

const OverlayPaper = styled(Box)(({ theme }) => ({
  minHeight: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(3),
  padding: theme.spacing(4),
  background:
    'radial-gradient(ellipse at center, rgba(255, 152, 0, 0.12) 0%, rgba(0, 0, 0, 0.92) 65%)',
  textAlign: 'center',
}))

const NameDisplay = styled(Typography)(({ theme }) => ({
  fontSize: 'clamp(1.75rem, 6vw, 2.75rem)',
  fontWeight: 800,
  lineHeight: 1.2,
  maxWidth: 'min(90vw, 28rem)',
  wordBreak: 'break-word',
  color: theme.palette.warning.light,
  animation: `${glow} 1.2s ease-in-out infinite`,
}))

const CountdownDisplay = styled(Typography)({
  fontSize: 'clamp(2.5rem, 12vw, 4.5rem)',
  fontWeight: 700,
  lineHeight: 1,
  fontVariantNumeric: 'tabular-nums',
  color: 'rgba(255, 255, 255, 0.92)',
})

function secondsRemaining(deadlineIso: string): number {
  const ms = new Date(deadlineIso).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 1000))
}

function formatResponseCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  return String(seconds)
}

type ChatRollRollRevealOverlayProps = {
  open: boolean
  win: ChatRollWin | null
  onClose: () => void
}

export function ChatRollRollRevealOverlay({
  open,
  win,
  onClose,
}: ChatRollRollRevealOverlayProps) {
  const { t } = useTranslation()
  const winnerName = win?.displayName ?? null
  const hasWinner = Boolean(winnerName)
  const showResponseCountdown =
    win?.responseStatus === 'pending' && Boolean(win.responseDeadlineAt)

  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (!open || !showResponseCountdown || !win?.responseDeadlineAt) {
      return
    }

    const deadline = win.responseDeadlineAt
    setRemaining(secondsRemaining(deadline))
    const timer = window.setInterval(() => {
      setRemaining(secondsRemaining(deadline))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [open, showResponseCountdown, win?.responseDeadlineAt])

  return (
    <Dialog
      open={open}
      fullScreen
      slotProps={{
        paper: {
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            backgroundImage: 'none',
          },
        },
        backdrop: {
          sx: { bgcolor: 'rgba(0, 0, 0, 0.72)' },
        },
      }}
    >
      <OverlayPaper>
        <Typography
          variant="overline"
          sx={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.2em' }}
        >
          {hasWinner
            ? t('chatRoll.rollRevealWinnerLabel')
            : t('chatRoll.rollRevealRolling')}
        </Typography>

        {hasWinner ? (
          <>
            <NameDisplay>{winnerName}</NameDisplay>
            {showResponseCountdown ? (
              <CountdownDisplay>
                {formatResponseCountdown(remaining)}
              </CountdownDisplay>
            ) : null}
          </>
        ) : (
          <>
            <CircularProgress color="warning" size={48} />
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>
              {t('chatRoll.rollRevealPicking')}
            </Typography>
          </>
        )}

        <Button
          variant="contained"
          color="warning"
          size="large"
          onClick={onClose}
          disabled={!hasWinner}
          sx={{ mt: 2, minWidth: 160 }}
        >
          {t('common.close')}
        </Button>
      </OverlayPaper>
    </Dialog>
  )
}
