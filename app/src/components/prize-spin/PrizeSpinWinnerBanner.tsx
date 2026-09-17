import { Box, Typography } from '@mui/material'
import {
  scaledPx,
  type PrizeSpinWidgetTheme,
} from '@/lib/prize-spin-widget-theme'

type PrizeSpinWinnerBannerProps = {
  participantNick: string
  sectorLabel: string
  theme: PrizeSpinWidgetTheme
  visible: boolean
}

export function PrizeSpinWinnerBanner({
  participantNick,
  sectorLabel,
  theme,
  visible,
}: PrizeSpinWinnerBannerProps) {
  const scale = theme.scale

  return (
    <Box
      sx={{
        bgcolor: theme.surface,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: `${scaledPx(14, scale)}px`,
        px: `${scaledPx(16, scale)}px`,
        py: `${scaledPx(12, scale)}px`,
        minHeight: scaledPx(56, scale),
        display: 'flex',
        alignItems: 'center',
        gap: `${scaledPx(8, scale)}px`,
        flexWrap: 'wrap',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${scaledPx(16, scale)}px)`,
        transition: 'opacity 400ms ease, transform 400ms ease',
        fontFamily: theme.fontFamily,
      }}
    >
      <Typography
        component="span"
        sx={{
          color: theme.textMuted,
          fontSize: scaledPx(13, scale),
          fontWeight: 500,
        }}
      >
        Winner:
      </Typography>
      <Typography
        component="span"
        sx={{
          color: theme.textPrimary,
          fontSize: scaledPx(18, scale),
          fontWeight: 700,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '40%',
        }}
      >
        {participantNick}
      </Typography>
      <Typography
        component="span"
        sx={{
          color: theme.textMuted,
          fontSize: scaledPx(14, scale),
        }}
      >
        ·
      </Typography>
      <Typography
        component="span"
        sx={{
          color: theme.moduleAccent,
          fontSize: scaledPx(16, scale),
          fontWeight: 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
          minWidth: 0,
        }}
      >
        {sectorLabel}
      </Typography>
    </Box>
  )
}
