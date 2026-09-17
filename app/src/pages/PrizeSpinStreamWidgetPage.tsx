import { Box, CircularProgress, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  fetchPublicPrizeSpinWidget,
  type PrizeSpinWidgetView,
} from '@/api/prize-spin'
import { PrizeSpinWidgetCard } from '@/components/prize-spin/PrizeSpinWidgetCard'
import { PRIZE_SPIN_WIDGET_THEME } from '@/lib/prize-spin-widget-theme'

const WIDGET_POLL_MS = 5000

function WidgetNotFound() {
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
      <Typography sx={{ color: PRIZE_SPIN_WIDGET_THEME.textMuted, fontSize: '1rem' }}>
        Session not found.
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
  const { id } = useParams<{ id: string }>()
  const prizeSpinId = useMemo(() => {
    if (!id) {
      return null
    }
    const parsed = Number.parseInt(id, 10)
    return Number.isFinite(parsed) ? parsed : null
  }, [id])

  const [view, setView] = useState<PrizeSpinWidgetView | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const loadView = useCallback(async () => {
    if (prizeSpinId === null) {
      setNotFound(true)
      setLoading(false)
      return
    }

    try {
      const data = await fetchPublicPrizeSpinWidget(prizeSpinId)
      setView(data)
      setNotFound(false)
    } catch {
      setView(null)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [prizeSpinId])

  useEffect(() => {
    setLoading(true)
    void loadView()
  }, [loadView])

  useEffect(() => {
    if (prizeSpinId === null) {
      return
    }

    const interval = window.setInterval(() => {
      void fetchPublicPrizeSpinWidget(prizeSpinId)
        .then((data) => {
          setView(data)
          setNotFound(false)
        })
        .catch(() => {
          setView(null)
          setNotFound(true)
        })
    }, WIDGET_POLL_MS)

    return () => window.clearInterval(interval)
  }, [prizeSpinId])

  if (loading) {
    return <WidgetLoading />
  }

  if (notFound || !view) {
    return <WidgetNotFound />
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
