import { Box, Chip, Stack, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import type { FirstReactionWidgetStylePreset } from '@/api/first-reaction'
import {
  getFirstReactionPresetPreviewDots,
  getFirstReactionWidgetPresetDisplayName,
} from '@/lib/first-reaction-widget-presets'

type FirstReactionWidgetThemePresetPickerProps = {
  presets: FirstReactionWidgetStylePreset[]
  activePresetId: number | null
  onSelectPreset: (presetId: number) => void
}

const PresetGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.75),
  gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))',
}))

const PresetChip = styled(Chip)({
  width: '100%',
  height: 28,
  justifyContent: 'flex-start',
  backgroundColor: 'transparent',
  '& .MuiChip-label': {
    paddingLeft: 6,
    paddingRight: 6,
    overflow: 'hidden',
    fontSize: '0.75rem',
  },
})

export function FirstReactionWidgetThemePresetPicker({
  presets,
  activePresetId,
  onSelectPreset,
}: FirstReactionWidgetThemePresetPickerProps) {
  const { t } = useTranslation()

  return (
    <Stack spacing={0.75}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
        {t('common.themePreset')}
      </Typography>
      <PresetGrid>
        {presets.map((preset) => {
          const selected = activePresetId === preset.id
          const dots = getFirstReactionPresetPreviewDots(preset.styleSettings)

          return (
            <PresetChip
              key={preset.id}
              label={
                <Stack direction="row" alignItems="center" gap={0.5} sx={{ minWidth: 0 }}>
                  <Box
                    component="span"
                    sx={{
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getFirstReactionWidgetPresetDisplayName(preset)}
                  </Box>
                  <Stack direction="row" gap={0.35} sx={{ flexShrink: 0, ml: 0.25 }}>
                    {dots.map((color) => (
                      <Box
                        key={`${preset.id}-${color}`}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: color,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>
              }
              onClick={() => onSelectPreset(preset.id)}
              variant="outlined"
              color={selected ? 'primary' : 'default'}
            />
          )
        })}
      </PresetGrid>
    </Stack>
  )
}
