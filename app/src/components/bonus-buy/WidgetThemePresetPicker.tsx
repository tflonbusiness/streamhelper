import { Box, Chip, Stack, Typography } from '@mui/material'
import {
  BONUS_BUY_WIDGET_PRESETS,
  type BonusBuyWidgetPresetId,
} from '@/lib/bonus-buy-widget-presets'

type WidgetThemePresetPickerProps = {
  activePresetId: BonusBuyWidgetPresetId | null
  onSelectPreset: (presetId: BonusBuyWidgetPresetId) => void
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
  activePresetId,
  onSelectPreset,
}: WidgetThemePresetPickerProps) {
  const isCustom = activePresetId === null

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Theme preset
        </Typography>
        {isCustom ? (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Custom
          </Typography>
        ) : null}
      </Stack>
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
        {BONUS_BUY_WIDGET_PRESETS.map((preset) => {
          const selected = activePresetId === preset.id
          return (
            <Chip
              key={preset.id}
              label={
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <span>{preset.name}</span>
                  <PreviewDots colors={preset.previewDots} />
                </Stack>
              }
              onClick={() => onSelectPreset(preset.id)}
              variant={selected ? 'filled' : 'outlined'}
              color={selected ? 'primary' : 'default'}
              sx={{
                width: '100%',
                height: 36,
                justifyContent: 'flex-start',
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
