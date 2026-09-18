import { Box, Typography } from '@mui/material'
import { PRIZE_SPIN_WIDGET_THEME } from '@/lib/prize-spin-widget-theme'

type PrizeSpinWidgetMessageProps = {
  message: string
  tone: 'muted' | 'warning'
}

export const PrizeSpinWidgetMessage = (props: PrizeSpinWidgetMessageProps) => {
  return (
    <Box
      sx={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
        fontFamily: PRIZE_SPIN_WIDGET_THEME.fontFamily,
      }}
    >
      <Typography
        sx={{
          color:
            props.tone === 'warning'
              ? PRIZE_SPIN_WIDGET_THEME.pointerFill
              : PRIZE_SPIN_WIDGET_THEME.textMuted,
          fontSize: '1rem',
          fontWeight: props.tone === 'warning' ? 500 : 400,
        }}
      >
        {props.message}
      </Typography>
    </Box>
  )
}
