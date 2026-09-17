import { Box, CircularProgress, Typography } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  fetchPublicPrizeSpinWidget,
  PrizeSpinWidgetNotFoundError,
  PrizeSpinWidgetNotLiveError,
  type PrizeSpinWidgetView,
} from '@/api/prize-spin'
import { PrizeSpinWidgetCard } from '@/components/prize-spin/PrizeSpinWidgetCard'
import { PRIZE_SPIN_WIDGET_THEME } from '@/lib/prize-spin-widget-theme'

const WIDGET_POLL_MS = 5000

type WidgetState = 'loading' | 'ready' | 'not_found' | 'not_live'

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
  const { channelSlug } = useParams<{ channelSlug: string }>()
  const [view, setView] = useState<PrizeSpinWidgetView | null>(null)
  const [widgetState, setWidgetState] = useState<WidgetState>('loading')
  const lastRecordIdRef = useRef<number | null>(null)

  const loadView = useCallback(async (showLoading = false) => {
    if (!channelSlug) {
      setView(null)
      setWidgetState('not_found')
      return
    }

    if (showLoading) {
      setWidgetState('loading')
    }

    try {
      const data = await fetchPublicPrizeSpinWidget(channelSlug)
      if (
        lastRecordIdRef.current !== null &&
        lastRecordIdRef.current !== data.record.id
      ) {
        lastRecordIdRef.current = data.record.id
      } else if (lastRecordIdRef.current === null) {
        lastRecordIdRef.current = data.record.id
      }
      setView(data)
      setWidgetState('ready')
    } catch (error) {
      setView(null)
      if (error instanceof PrizeSpinWidgetNotLiveError) {
        setWidgetState('not_live')
        return
      }
      if (error instanceof PrizeSpinWidgetNotFoundError) {
        setWidgetState('not_found')
        return
      }
      setWidgetState('not_found')
    }
  }, [channelSlug])

  useEffect(() => {
    void loadView(true)
  }, [loadView])

  useEffect(() => {
    if (!channelSlug) {
      return
    }

    const interval = window.setInterval(() => {
      void loadView(false)
    }, WIDGET_POLL_MS)

    return () => window.clearInterval(interval)
  }, [channelSlug, loadView])

  if (widgetState === 'loading') {
    return <WidgetLoading />
  }

  if (widgetState === 'not_found') {
    return <WidgetMessage message="Session not found." tone="muted" />
  }

  if (widgetState === 'not_live' || !view) {
    return <WidgetMessage message="No live session." tone="warning" />
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
