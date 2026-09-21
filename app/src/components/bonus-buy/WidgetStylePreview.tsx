import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useMemo } from 'react'
import type { BonusBuyRecord, BonusBuySlot, BonusBuyWidgetSettings } from '@/api/bonus-buy'
import { BonusBuyWidgetCard } from '@/components/bonus-buy/widget/BonusBuyWidgetCard'
import { deriveBonusBuyWidgetCardProps } from '@/lib/bonus-buy-widget-presentation'

type WidgetStylePreviewProps = {
  record: BonusBuyRecord | null
  slots: BonusBuySlot[]
  previewTheme: BonusBuyWidgetSettings | null
  dimensionLabel?: string
  validationError: string | null
}

export function WidgetStylePreview({
  record,
  slots,
  previewTheme,
  dimensionLabel,
  validationError,
}: WidgetStylePreviewProps) {
  const cardProps = useMemo(() => {
    if (!record || !previewTheme) {
      return null
    }

    return deriveBonusBuyWidgetCardProps(
      { id: record.id, startBalance: record.startBalance },
      slots,
      previewTheme,
    )
  }, [record, slots, previewTheme])

  if (!record || !previewTheme || !cardProps) {
    return (
      <Box
        sx={{
          minHeight: 280,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#0A0A0C',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography sx={{ color: 'text.secondary' }}>Preview unavailable</Typography>
      </Box>
    )
  }

  const label =
    dimensionLabel ?? `${previewTheme.width} × ${previewTheme.height}`

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minHeight: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
        Live preview · {label}
      </Typography>
      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minHeight: 320,
          maxHeight: 480,
          bgcolor: '#050506',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'auto',
          p: 1,
        }}
      >
        <Box
          sx={{
            width: previewTheme.width,
            height: previewTheme.height,
            flexShrink: 0,
            mx: 'auto',
          }}
        >
          <BonusBuyWidgetCard {...cardProps} />
        </Box>

        {validationError ? (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha('#000000', 0.55),
              p: 2,
            }}
          >
            <Box
              sx={{
                maxWidth: 320,
                bgcolor: alpha('#1F1F24', 0.95),
                border: '1px solid',
                borderColor: 'error.main',
                borderRadius: 2,
                px: 2,
                py: 1.5,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: 'error.main', fontWeight: 700, mb: 0.5 }}
              >
                Invalid style
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                {validationError}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                Showing last valid preview underneath.
              </Typography>
            </Box>
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}
