import { Box } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { ChatRollWidgetNotFoundError } from '@/api/chat-roll'
import { ChatRollWidgetCard } from '@/components/chat-roll/widget/ChatRollWidgetCard'
import { ChatRollWidgetMessage } from '@/components/chat-roll/widget/ChatRollWidgetMessage'
import { CHAT_ROLL_WIDGET_DEFAULTS } from '@/lib/chat-roll-widget-defaults'
import { CHAT_ROLL_WIDGET_THEME } from '@/lib/chat-roll-widget-theme'
import { publicWidgetUnavailableMessage } from '@/lib/public-widget'
import { usePinWidgetUiEnglish, widgetUiCopy } from '@/i18n/widget-ui'
import { usePublicChatRollWidget } from '@/queries/use-chat-rolls'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function ChatRollStreamWidgetPage() {
  usePinWidgetUiEnglish()
  const { ucid } = useParams<{ ucid: string }>()

  const accountUcid = useMemo(() => {
    if (!ucid || !UUID_REGEX.test(ucid)) {
      return null
    }
    return ucid
  }, [ucid])

  const { data: view, error, isLoading, isPending } =
    usePublicChatRollWidget(accountUcid)

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
          width: CHAT_ROLL_WIDGET_DEFAULTS.width,
          height: CHAT_ROLL_WIDGET_DEFAULTS.height,
          mx: 'auto',
          bgcolor: 'transparent',
        }}
      />
    )
  }

  if (error instanceof ChatRollWidgetNotFoundError || error || !view) {
    return (
      <ChatRollWidgetMessage
        message={widgetUiCopy.accountNotFound}
        tone="muted"
      />
    )
  }

  if (view.status === 'unavailable') {
    return (
      <ChatRollWidgetMessage
        message={publicWidgetUnavailableMessage('chatRoll', view.reason)}
        tone="muted"
      />
    )
  }

  const viewportWidth = CHAT_ROLL_WIDGET_DEFAULTS.width
  const viewportHeight = CHAT_ROLL_WIDGET_DEFAULTS.height

  return (
    <Box
      sx={{
        width: viewportWidth,
        height: viewportHeight,
        minHeight: viewportHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
        overflow: 'hidden',
        fontFamily: CHAT_ROLL_WIDGET_THEME.fontFamily,
        mx: 'auto',
      }}
    >
      <ChatRollWidgetCard
        widgetKeywordPrefix={view.record.widgetKeywordPrefix}
        keyword={view.record.keyword}
        width={viewportWidth}
        height={viewportHeight}
      />
    </Box>
  )
}
