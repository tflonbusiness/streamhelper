import { Box, Typography } from '@mui/material'

type StreamWidgetMessageProps = {
  message: string
}

export function StreamWidgetMessage({ message }: StreamWidgetMessageProps) {
  return (
    <Box
      sx={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
        fontFamily: 'Inter, system-ui, sans-serif',
        px: 2,
        textAlign: 'center',
      }}
    >
      <Typography sx={{ color: '#9CA3AF', fontSize: '1rem', maxWidth: 420 }}>
        {message}
      </Typography>
    </Box>
  )
}
