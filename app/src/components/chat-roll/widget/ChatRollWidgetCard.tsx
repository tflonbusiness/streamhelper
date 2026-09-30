import { Box, Typography } from '@mui/material'
import { useMemo } from 'react'
import { ChatRollWidgetShrinkToFit } from '@/components/chat-roll/widget/ChatRollWidgetShrinkToFit'
import { formatChatRollWidgetLine } from '@/lib/format-chat-roll-widget-line'
import { CHAT_ROLL_WIDGET_THEME } from '@/lib/chat-roll-widget-theme'

type ChatRollWidgetCardProps = {
  widgetKeywordPrefix: string
  keyword: string
  width: number
  height: number
}

export function ChatRollWidgetCard(props: ChatRollWidgetCardProps) {
  const line = useMemo(
    () => formatChatRollWidgetLine(props.widgetKeywordPrefix, props.keyword),
    [props.widgetKeywordPrefix, props.keyword],
  )

  const scale = Math.min(props.width, props.height) / 500
  const baseFontSize = Math.max(24, 40 * scale)

  return (
    <Box
      sx={{
        width: props.width,
        height: props.height,
        boxSizing: 'border-box',
        bgcolor: 'transparent',
        px: `${16 * scale}px`,
        py: `${8 * scale}px`,
      }}
    >
      <ChatRollWidgetShrinkToFit>
        <Typography
          component="p"
          aria-label={line}
          sx={{
            m: 0,
            color: CHAT_ROLL_WIDGET_THEME.textPrimary,
            fontSize: baseFontSize,
            fontWeight: 700,
            lineHeight: 1.2,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            textShadow:
              '0 2px 12px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)',
          }}
        >
          {line}
        </Typography>
      </ChatRollWidgetShrinkToFit>
    </Box>
  )
}
