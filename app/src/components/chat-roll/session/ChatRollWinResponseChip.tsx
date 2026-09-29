import { Chip, Tooltip } from '@mui/material'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined'
import { useEffect, useState, type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import type { ChatRollWin } from '@/api/chat-roll'

function secondsRemaining(deadlineIso: string): number {
  const ms = new Date(deadlineIso).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 1000))
}

function StatusIconTooltip({
  title,
  children,
}: {
  title: string
  children: ReactElement
}) {
  return (
    <Tooltip title={title} arrow describeChild>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          lineHeight: 0,
        }}
      >
        {children}
      </span>
    </Tooltip>
  )
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
    const label = t('chatRoll.winnerResponseNotRequired')
    return (
      <StatusIconTooltip title={label}>
        <CheckCircleOutlineOutlinedIcon
          color="success"
          fontSize="small"
          aria-label={label}
        />
      </StatusIconTooltip>
    )
  }

  if (win.responseStatus === 'confirmed') {
    const label = t('chatRoll.winnerConfirmed')
    return (
      <StatusIconTooltip title={label}>
        <CheckCircleOutlineOutlinedIcon
          color="success"
          fontSize="small"
          aria-label={label}
        />
      </StatusIconTooltip>
    )
  }

  if (win.responseStatus === 'pending') {
    const label = t('chatRoll.winnerAwaitingResponse', { seconds: remaining })
    return (
      <Tooltip title={label} arrow>
        <Chip
          size="small"
          color="warning"
          variant="filled"
          label={label}
          aria-label={label}
        />
      </Tooltip>
    )
  }

  const label = t('chatRoll.winnerNoResponse')
  return (
    <StatusIconTooltip title={label}>
      <HighlightOffOutlinedIcon color="error" fontSize="small" aria-label={label} />
    </StatusIconTooltip>
  )
}
