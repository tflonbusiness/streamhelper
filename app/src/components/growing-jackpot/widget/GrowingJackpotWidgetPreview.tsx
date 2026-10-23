import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { PublicGrowingJackpotWidget } from '@/api/growing-jackpot'
import { HexColorField } from '@/components/bonus-buy/HexColorField'
import { GrowingJackpotWidgetCard } from '@/components/growing-jackpot/widget/GrowingJackpotWidgetCard'
import type { GrowingJackpotWidgetStyle } from '@/lib/growing-jackpot-widget-style-defaults'

type GrowingJackpotWidgetPreviewProps = {
  width: number
  height: number
  styleDraft: GrowingJackpotWidgetStyle
  previewBackdropColor: string
  onPreviewBackdropColorChange: (color: string) => void
}

function buildDemoView(
  width: number,
  height: number,
  style: GrowingJackpotWidgetStyle,
): PublicGrowingJackpotWidget {
  const now = new Date()
  const endsAt = new Date(now.getTime() + 120_000).toISOString()
  return {
    status: 'accepting',
    joinKeyword: '!join',
    settings: { winnerOverlaySeconds: 8 },
    width,
    height,
    style,
    round: {
      id: 0,
      growingJackpotId: 0,
      roundIndex: 1,
      joinKeyword: '!join',
      phase: 'accepting',
      result: null,
      endsAt,
      participantCount: 42,
      displayPrize: 128,
      closedAt: null,
      winnerProvider: null,
      winnerProviderUserId: null,
      winnerDisplayName: null,
      proofToken: null,
      fulfillmentStatus: 'pending',
      startedByUserId: 0,
      createdAt: now.toISOString(),
    },
  }
}

export function GrowingJackpotWidgetPreview({
  width,
  height,
  styleDraft,
  previewBackdropColor,
  onPreviewBackdropColorChange,
}: GrowingJackpotWidgetPreviewProps) {
  const { t } = useTranslation()
  const view = buildDemoView(width, height, styleDraft)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', fontWeight: 600 }}
      >
        {t('growingJackpot.widgetPreviewLabel')} · {width} × {height}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
        {t('growingJackpot.widgetPreviewDemoHint')}
      </Typography>
      <HexColorField
        label={t('growingJackpot.widgetPreviewBackdrop')}
        value={previewBackdropColor}
        onChange={onPreviewBackdropColorChange}
      />
      <Box
        sx={{
          position: 'relative',
          minHeight: 280,
          maxHeight: 520,
          bgcolor: previewBackdropColor,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <GrowingJackpotWidgetCard view={view} width={width} height={height} />
      </Box>
    </Box>
  )
}
