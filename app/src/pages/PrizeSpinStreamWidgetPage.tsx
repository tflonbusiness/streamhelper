import { Box } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { PrizeSpinWidgetNotFoundError } from '@/api/prize-spin'
import { PrizeSpinWidgetCard } from '@/components/prize-spin/widget/PrizeSpinWidgetCard'
import { PrizeSpinWidgetLoading } from '@/components/prize-spin/widget/PrizeSpinWidgetLoading'
import { PrizeSpinWidgetMessage } from '@/components/prize-spin/widget/PrizeSpinWidgetMessage'
import { attachPrizeSpinWheelAudioUnlock } from '@/lib/prize-spin-wheel-audio'
import { PRIZE_SPIN_WIDGET_DEFAULTS } from '@/lib/prize-spin-widget-defaults'
import { PRIZE_SPIN_WIDGET_THEME } from '@/lib/prize-spin-widget-theme'
import { publicWidgetUnavailableMessage } from '@/lib/public-widget'
import { usePinWidgetUiEnglish, widgetUiCopy } from '@/i18n/widget-ui'
import { usePublicPrizeSpinWidget } from '@/queries/use-prize-spins'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function PrizeSpinStreamWidgetPage() {
  usePinWidgetUiEnglish()
  const { ucid } = useParams<{ ucid: string }>()

  const accountUcid = useMemo(() => {
    if (!ucid || !UUID_REGEX.test(ucid)) {
      return null
    }
    return ucid
  }, [ucid])

  const { data: view, error, isLoading, isPending } =
    usePublicPrizeSpinWidget(accountUcid)

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

  if (accountUcid === null) {
    return (
      <PrizeSpinWidgetMessage
        message={widgetUiCopy.accountNotFound}
        tone="muted"
      />
    )
  }

  if (isPending && isLoading) {
    return <PrizeSpinWidgetLoading />
  }

  if (error instanceof PrizeSpinWidgetNotFoundError || error || !view) {
    return (
      <PrizeSpinWidgetMessage
        message={widgetUiCopy.accountNotFound}
        tone="muted"
      />
    )
  }

  if (view.status === 'unavailable') {
    return (
      <PrizeSpinWidgetMessage
        message={publicWidgetUnavailableMessage('prizeSpin', view.reason)}
        tone="muted"
      />
    )
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
        showSectorWeightInWinner={
          view.settings.showSectorWeightInWinner ??
          PRIZE_SPIN_WIDGET_DEFAULTS.showSectorWeightInWinner
        }
      />
    </Box>
  )
}
