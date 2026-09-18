import { Box, CircularProgress, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { BonusBuyWidgetCard } from '@/components/bonus-buy/BonusBuyWidgetCard'
import { deriveBonusBuyWidgetCardProps } from '@/lib/bonus-buy-widget-presentation'
import { usePublicBonusBuyWidget } from '@/queries/use-bonus-buy'

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

  const {
    data: view,
    isLoading,
    isPending,
    isError,
  } = usePublicBonusBuyWidget(bonusBuyId)

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

  if (bonusBuyId === null) {
    return <WidgetNotFound />
  }

  if (isPending && isLoading) {
    return <WidgetLoading />
  }

  if (isError || !view || !cardProps) {
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
