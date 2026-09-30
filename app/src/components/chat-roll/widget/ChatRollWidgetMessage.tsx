import { Box, Typography } from '@mui/material'
import { CHAT_ROLL_WIDGET_THEME } from '@/lib/chat-roll-widget-theme'

type ChatRollWidgetMessageProps = {
  message: string
  tone: 'muted' | 'warning'
}

export function ChatRollWidgetMessage(props: ChatRollWidgetMessageProps) {
  return (
    <Box
      sx={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
        fontFamily: CHAT_ROLL_WIDGET_THEME.fontFamily,
        px: 2,
        textAlign: 'center',
      }}
    >
      <Typography
        sx={{
          color:
            props.tone === 'warning'
              ? CHAT_ROLL_WIDGET_THEME.moduleAccent
              : CHAT_ROLL_WIDGET_THEME.textMuted,
          fontSize: '1rem',
          fontWeight: props.tone === 'warning' ? 500 : 400,
          maxWidth: 420,
        }}
      >
        {props.message}
      </Typography>
    </Box>
  )
}
