import { Box, Chip, Stack, Typography } from '@mui/material'
import type { BonusBuyWidgetStylePreset } from '@/api/bonus-buy'
import {
  getBonusBuyWidgetPresetDisplayName,
  getPresetPreviewDots,
} from '@/lib/bonus-buy-widget-presets'

type WidgetThemePresetPickerProps = {
  presets: BonusBuyWidgetStylePreset[]
  activePresetId: number | null
  onSelectPreset: (presetId: number) => void
}

function PreviewDots({ colors }: { colors: [string, string, string] }) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ ml: 0.5 }}>
      {colors.map((color) => (
        <Box
          key={color}
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: color,
            border: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        />
      ))}
    </Stack>
  )
}

export function WidgetThemePresetPicker({
  presets,
  activePresetId,
  onSelectPreset,
}: WidgetThemePresetPickerProps) {
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Theme preset
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 1,
        }}
      >
        {presets.map((preset) => {
          const selected = activePresetId === preset.id
          return (
            <Chip
              key={preset.id}
              label={
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <span>{getBonusBuyWidgetPresetDisplayName(preset)}</span>
                  <PreviewDots colors={getPresetPreviewDots(preset.styleSettings)} />
                </Stack>
              }
              onClick={() => onSelectPreset(preset.id)}
              variant="outlined"
              color={selected ? 'primary' : 'default'}
              sx={{
                width: '100%',
                height: 36,
                justifyContent: 'flex-start',
                bgcolor: 'transparent',
                '& .MuiChip-label': {
                  px: 1,
                  overflow: 'hidden',
                },
              }}
            />
          )
        })}
      </Box>
    </Stack>
  )
}
