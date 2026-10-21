import { Box } from '@mui/material'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { FirstReactionWidgetNotFoundError } from '@/api/first-reaction'
import { FirstReactionWidgetCard } from '@/components/first-reaction/widget/FirstReactionWidgetCard'
import { ChatRollWidgetMessage } from '@/components/chat-roll/widget/ChatRollWidgetMessage'
import {
  obsBrowserSourceBoxSx,
  useObsBrowserSourceLayout,
} from '@/hooks/useObsBrowserSourceLayout'
import { usePinWidgetUiEnglish, widgetUiCopy } from '@/i18n/widget-ui'
import { publicWidgetUnavailableMessage } from '@/lib/public-widget'
import { FIRST_REACTION_WIDGET_DEFAULTS } from '@/lib/first-reaction-widget-defaults'
import { usePublicFirstReactionWidget } from '@/queries/use-first-reaction-widget'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function FirstReactionStreamWidgetPage() {
  usePinWidgetUiEnglish()
  const { ucid } = useParams<{ ucid: string }>()

  const accountUcid = useMemo(() => {
    if (!ucid || !UUID_REGEX.test(ucid)) {
      return null
    }
    return ucid
  }, [ucid])

  const { data: view, error, isLoading, isPending } =
    usePublicFirstReactionWidget(accountUcid)

  const obsSize = {
    width: view?.status === 'active' ? view.width : FIRST_REACTION_WIDGET_DEFAULTS.width,
    height:
      view?.status === 'active' ? view.height : FIRST_REACTION_WIDGET_DEFAULTS.height,
  }

  useObsBrowserSourceLayout(
    view?.status === 'active' ? obsSize : undefined,
  )

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
          width: FIRST_REACTION_WIDGET_DEFAULTS.width,
          height: FIRST_REACTION_WIDGET_DEFAULTS.height,
          mx: 'auto',
          bgcolor: 'transparent',
        }}
      />
    )
  }

  if (error instanceof FirstReactionWidgetNotFoundError || error || !view) {
    return (
      <ChatRollWidgetMessage
        message={widgetUiCopy.accountNotFound}
        tone="muted"
      />
    )
  }

  if (view.status === 'unavailable') {
    const reason = view.reason as
      | 'no_live_session'
      | 'no_sessions'
      | 'subscription_expired'
      | 'entitlement_over_limit'
    return (
      <ChatRollWidgetMessage
        message={publicWidgetUnavailableMessage('firstReaction', reason)}
        tone="muted"
      />
    )
  }

  return (
    <Box
      sx={{
        ...obsBrowserSourceBoxSx(obsSize),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <FirstReactionWidgetCard
        view={view}
        width={view.width}
        height={view.height}
      />
    </Box>
  )
}
