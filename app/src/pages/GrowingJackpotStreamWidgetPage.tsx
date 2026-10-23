import { Box } from '@mui/material'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { GrowingJackpotWidgetNotFoundError } from '@/api/growing-jackpot'
import { GrowingJackpotWidgetCard } from '@/components/growing-jackpot/widget/GrowingJackpotWidgetCard'
import { ChatRollWidgetMessage } from '@/components/chat-roll/widget/ChatRollWidgetMessage'
import {
  obsBrowserSourceBoxSx,
  useObsBrowserSourceLayout,
} from '@/hooks/useObsBrowserSourceLayout'
import { usePinWidgetUiEnglish, widgetUiCopy } from '@/i18n/widget-ui'
import { useGrowingJackpotTerminalOverlay } from '@/hooks/use-growing-jackpot-terminal-overlay'
import { GROWING_JACKPOT_WIDGET_DEFAULTS } from '@/lib/growing-jackpot-widget-defaults'
import { usePublicGrowingJackpotWidget } from '@/queries/use-growing-jackpot-widget'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function GrowingJackpotStreamWidgetPage() {
  usePinWidgetUiEnglish()
  const { ucid } = useParams<{ ucid: string }>()

  const accountUcid = useMemo(() => {
    if (!ucid || !UUID_REGEX.test(ucid)) {
      return null
    }
    return ucid
  }, [ucid])

  const { data: rawView, error, isLoading, isPending } =
    usePublicGrowingJackpotWidget(accountUcid)
  const view = useGrowingJackpotTerminalOverlay(rawView)

  const width =
    view && view.status !== 'unavailable'
      ? view.width
      : GROWING_JACKPOT_WIDGET_DEFAULTS.width
  const height =
    view && view.status !== 'unavailable'
      ? view.height
      : GROWING_JACKPOT_WIDGET_DEFAULTS.height

  useObsBrowserSourceLayout({ width, height })

  if (accountUcid === null) {
    return (
      <ChatRollWidgetMessage
        message={widgetUiCopy.accountNotFound}
        tone="muted"
      />
    )
  }

  if (isPending && isLoading) {
    return (
      <Box
        sx={{
          width: GROWING_JACKPOT_WIDGET_DEFAULTS.width,
          height: GROWING_JACKPOT_WIDGET_DEFAULTS.height,
          mx: 'auto',
          bgcolor: 'transparent',
        }}
      />
    )
  }

  if (error instanceof GrowingJackpotWidgetNotFoundError || error || !view) {
    return (
      <ChatRollWidgetMessage
        message={widgetUiCopy.accountNotFound}
        tone="muted"
      />
    )
  }

  return (
    <Box
      data-testid="growing-jackpot-stream-widget"
      sx={obsBrowserSourceBoxSx({ width, height })}
    >
      <GrowingJackpotWidgetCard view={view} width={width} height={height} />
    </Box>
  )
}
