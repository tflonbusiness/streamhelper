import { Chip } from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ChatRollWin } from '@/api/chat-roll'

function secondsRemaining(deadlineIso: string): number {
  const ms = new Date(deadlineIso).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 1000))
}

type ChatRollWinResponseChipProps = {
  win: ChatRollWin
}

export function ChatRollWinResponseChip({ win }: ChatRollWinResponseChipProps) {
  const { t } = useTranslation()
  const [remaining, setRemaining] = useState(() =>
    win.responseDeadlineAt ? secondsRemaining(win.responseDeadlineAt) : 0,
  )

  useEffect(() => {
    if (win.responseStatus !== 'pending' || !win.responseDeadlineAt) {
      return
    }

    setRemaining(secondsRemaining(win.responseDeadlineAt))
    const timer = window.setInterval(() => {
      setRemaining(secondsRemaining(win.responseDeadlineAt!))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [win.responseStatus, win.responseDeadlineAt])

  if (win.responseStatus === 'not_required') {
    return null
  }

  if (win.responseStatus === 'pending') {
    return (
      <Chip
        size="small"
        color="warning"
        variant="outlined"
        label={t('chatRoll.winnerAwaitingResponse', { seconds: remaining })}
      />
    )
  }

  if (win.responseStatus === 'confirmed') {
    return (
      <Chip
        size="small"
        color="success"
        variant="outlined"
        label={t('chatRoll.winnerConfirmed')}
      />
    )
  }

  return (
    <Chip
      size="small"
      color="default"
      variant="outlined"
      label={t('chatRoll.winnerNoResponse')}
    />
  )
}
