import { Box, CircularProgress } from '@mui/material'
import { PRIZE_SPIN_WIDGET_THEME } from '@/lib/prize-spin-widget-theme'

export const PrizeSpinWidgetLoading = () => {
  return (
    <Box
      sx={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
      }}
    >
      <CircularProgress
        size={32}
        sx={{ color: PRIZE_SPIN_WIDGET_THEME.moduleAccent }}
      />
    </Box>
  )
}
