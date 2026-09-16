import { Box, CircularProgress, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  fetchPublicBonusBuyWidget,
  type BonusBuyWidgetView,
} from '@/api/bonus-buy'
import { BonusBuyWidgetCard } from '@/components/bonus-buy/BonusBuyWidgetCard'
import { deriveBonusBuyWidgetCardProps } from '@/lib/bonus-buy-widget-presentation'

const WIDGET_POLL_MS = 5000

function WidgetNotFound({ textMutedColor }: { textMutedColor?: string }) {
  return (
    <Box
      sx={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <Typography sx={{ color: textMutedColor ?? '#9CA3AF', fontSize: '1rem' }}>
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
      <CircularProgress size={32} sx={{ color: '#F59E0B' }} />
    </Box>
  )
}

export function BonusBuyStreamWidgetPage() {
  const { id } = useParams<{ id: string }>()
  const bonusBuyId = useMemo(() => {
    if (!id) {
      return null
    }
    const parsed = Number.parseInt(id, 10)
    return Number.isFinite(parsed) ? parsed : null
  }, [id])

  const [view, setView] = useState<BonusBuyWidgetView | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const loadView = useCallback(async () => {
    if (bonusBuyId === null) {
      setNotFound(true)
      setLoading(false)
      return
    }

    try {
      const data = await fetchPublicBonusBuyWidget(bonusBuyId)
      setView(data)
      setNotFound(false)
    } catch {
      setView(null)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [bonusBuyId])

  useEffect(() => {
    setLoading(true)
    void loadView()
  }, [loadView])

  useEffect(() => {
    if (bonusBuyId === null) {
      return
    }

    const interval = window.setInterval(() => {
      void fetchPublicBonusBuyWidget(bonusBuyId)
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
  }, [bonusBuyId])

  const cardProps = useMemo(() => {
    if (!view) {
      return null
    }

    return deriveBonusBuyWidgetCardProps(
      { id: view.record.id, startBalance: view.record.startBalance },
      view.slots,
      view.settings,
    )
  }, [view])

  if (loading) {
    return <WidgetLoading />
  }

  if (notFound || !view || !cardProps) {
    return <WidgetNotFound />
  }

  const theme = view.settings

  return (
    <Box
      sx={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
        p: 2,
        fontFamily: theme.fontFamily,
      }}
    >
      <Box sx={{ maxWidth: '100%' }}>
        <BonusBuyWidgetCard {...cardProps} />
      </Box>
    </Box>
  )
}
