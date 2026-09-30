import { Stack } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { ChatRollWin } from '@/api/chat-roll'
import { formatDateTime } from '@/lib/format-date-time'

type ChatRollWinnerNickTooltipContentProps = {
  win: ChatRollWin
}

export function ChatRollWinnerNickTooltipContent({
  win,
}: ChatRollWinnerNickTooltipContentProps) {
  const { t } = useTranslation()
  const showConfirmed =
    win.responseStatus === 'confirmed' && win.respondedAt !== null

  return (
    <Stack spacing={0.25}>
      <span>
        {t('chatRoll.winnerTooltipWon', {
          time: formatDateTime(win.createdAt),
        })}
      </span>
      {showConfirmed ? (
        <span>
          {t('chatRoll.winnerTooltipConfirmed', {
            time: formatDateTime(win.respondedAt!),
          })}
        </span>
      ) : null}
    </Stack>
  )
}
