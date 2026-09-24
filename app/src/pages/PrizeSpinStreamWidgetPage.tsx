import { Box } from '@mui/material'
import { useParams } from 'react-router-dom'
import { PrizeSpinWidgetNotFoundError } from '@/api/prize-spin'
import { PrizeSpinWidgetCard } from '@/components/prize-spin/widget/PrizeSpinWidgetCard'
import { PrizeSpinWidgetLoading } from '@/components/prize-spin/widget/PrizeSpinWidgetLoading'
import { PrizeSpinWidgetMessage } from '@/components/prize-spin/widget/PrizeSpinWidgetMessage'
import { PRIZE_SPIN_WIDGET_THEME } from '@/lib/prize-spin-widget-theme'
import { usePublicPrizeSpinWidget } from '@/queries/use-prize-spins'

export function PrizeSpinStreamWidgetPage() {
  const { id } = useParams<{ id: string }>()
  const prizeSpinId = Number.parseInt(id ?? '', 10)
  const isValidId = Number.isFinite(prizeSpinId)
  const { data: view, error, isLoading, isPending } =
    usePublicPrizeSpinWidget(isValidId ? prizeSpinId : undefined)

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
