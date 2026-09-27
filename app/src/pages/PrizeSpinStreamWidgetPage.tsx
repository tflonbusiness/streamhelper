import { Box } from '@mui/material'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { PrizeSpinWidgetNotFoundError } from '@/api/prize-spin'
import { PrizeSpinWidgetCard } from '@/components/prize-spin/widget/PrizeSpinWidgetCard'
import { PrizeSpinWidgetLoading } from '@/components/prize-spin/widget/PrizeSpinWidgetLoading'
import { PrizeSpinWidgetMessage } from '@/components/prize-spin/widget/PrizeSpinWidgetMessage'
import { attachPrizeSpinWheelAudioUnlock } from '@/lib/prize-spin-wheel-audio'
import { PRIZE_SPIN_WIDGET_DEFAULTS } from '@/lib/prize-spin-widget-defaults'
import { PRIZE_SPIN_WIDGET_THEME } from '@/lib/prize-spin-widget-theme'
import { usePublicPrizeSpinWidget } from '@/queries/use-prize-spins'

export function PrizeSpinStreamWidgetPage() {
  const { id } = useParams<{ id: string }>()
  const prizeSpinId = Number.parseInt(id ?? '', 10)
  const isValidId = Number.isFinite(prizeSpinId)
  const { data: view, error, isLoading, isPending } =
    usePublicPrizeSpinWidget(isValidId ? prizeSpinId : undefined)

  useEffect(() => {
    const prevBody = document.body.style.overflow
    const prevHtml = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevBody
      document.documentElement.style.overflow = prevHtml
    }
  }, [])

  useEffect(() => attachPrizeSpinWheelAudioUnlock(), [])

  if (!isValidId) {
    return <PrizeSpinWidgetMessage message="Session not found." tone="muted" />
  }

  if (isPending && isLoading) {
    return <PrizeSpinWidgetLoading />
  }

  if (error instanceof PrizeSpinWidgetNotFoundError || error || !view) {
    return <PrizeSpinWidgetMessage message="Session not found." tone="muted" />
  }

  return (
    <Box
      sx={{
        width: view.settings.width,
        height: view.settings.height,
        minHeight: view.settings.height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
        overflow: 'hidden',
        fontFamily: PRIZE_SPIN_WIDGET_THEME.fontFamily,
        mx: 'auto',
      }}
    >
      <PrizeSpinWidgetCard
        recordId={view.record.id}
        sectors={view.sectors}
        latestWin={view.latestWin}
        width={view.settings.width}
        height={view.settings.height}
        equalSectorSlices={
          view.settings.equalSectorSlices ??
          PRIZE_SPIN_WIDGET_DEFAULTS.equalSectorSlices
        }
      />
    </Box>
  )
}
