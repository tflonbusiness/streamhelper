import { Box, CircularProgress, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import {
  PrizeSpinWidgetNotFoundError,
  PrizeSpinWidgetNotLiveError,
} from '@/api/prize-spin'
import { PrizeSpinWidgetCard } from '@/components/prize-spin/PrizeSpinWidgetCard'
import { PRIZE_SPIN_WIDGET_THEME } from '@/lib/prize-spin-widget-theme'
import { usePublicPrizeSpinWidget } from '@/queries/use-prize-spins'

function WidgetMessage({
  message,
  tone,
}: {
  message: string
  tone: 'muted' | 'warning'
}) {
  return (
    <Box
      sx={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
        fontFamily: PRIZE_SPIN_WIDGET_THEME.fontFamily,
      }}
    >
      <Typography
        sx={{
          color:
            tone === 'warning'
              ? PRIZE_SPIN_WIDGET_THEME.pointerFill
              : PRIZE_SPIN_WIDGET_THEME.textMuted,
          fontSize: '1rem',
          fontWeight: tone === 'warning' ? 500 : 400,
        }}
      >
        {message}
      </Typography>
    </Box>
  )
}

function WidgetLoading() {
  return (
    <Box
      sx={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
      }}
    >
      <CircularProgress
        size={32}
        sx={{ color: PRIZE_SPIN_WIDGET_THEME.moduleAccent }}
      />
    </Box>
  )
}

export function PrizeSpinStreamWidgetPage() {
  const { ucid } = useParams<{ ucid: string }>()
  const { data: view, error, isLoading, isPending } = usePublicPrizeSpinWidget(ucid)

  if (!ucid) {
    return <WidgetMessage message="Session not found." tone="muted" />
  }

  if (isPending && isLoading) {
    return <WidgetLoading />
  }

  if (error instanceof PrizeSpinWidgetNotLiveError) {
    return <WidgetMessage message="No live session." tone="warning" />
  }

  if (error instanceof PrizeSpinWidgetNotFoundError || error || !view) {
    return <WidgetMessage message="Session not found." tone="muted" />
  }

  return (
    <Box
      sx={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
        p: 2,
        fontFamily: PRIZE_SPIN_WIDGET_THEME.fontFamily,
      }}
    >
      <PrizeSpinWidgetCard
        recordId={view.record.id}
        sectors={view.sectors}
        latestWin={view.latestWin}
        width={view.settings.width}
        height={view.settings.height}
      />
    </Box>
  )
}
