import { Box } from '@mui/material'
import { useParams } from 'react-router-dom'
import {
  PrizeSpinWidgetNotFoundError,
  PrizeSpinWidgetNotLiveError,
} from '@/api/prize-spin'
import { PrizeSpinWidgetCard } from '@/components/prize-spin/widget/PrizeSpinWidgetCard'
import { PrizeSpinWidgetLoading } from '@/components/prize-spin/widget/PrizeSpinWidgetLoading'
import { PrizeSpinWidgetMessage } from '@/components/prize-spin/widget/PrizeSpinWidgetMessage'
import { PRIZE_SPIN_WIDGET_THEME } from '@/lib/prize-spin-widget-theme'
import { usePublicPrizeSpinWidget } from '@/queries/use-prize-spins'

export function PrizeSpinStreamWidgetPage() {
  const { ucid } = useParams<{ ucid: string }>()
  const { data: view, error, isLoading, isPending } = usePublicPrizeSpinWidget(ucid)

  if (!ucid) {
    return <PrizeSpinWidgetMessage message="Session not found." tone="muted" />
  }

  if (isPending && isLoading) {
    return <PrizeSpinWidgetLoading />
  }

  if (error instanceof PrizeSpinWidgetNotLiveError) {
    return <PrizeSpinWidgetMessage message="No live session." tone="warning" />
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
