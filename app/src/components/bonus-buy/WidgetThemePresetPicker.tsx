import { Box, Chip, Stack, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { BonusBuyWidgetStylePreset } from '@/api/bonus-buy'
import {
  getBonusBuyWidgetPresetDisplayName,
  getPresetPreviewDots,
} from '@/lib/bonus-buy-widget-presets'

type WidgetThemePresetPickerProps = {
  presets: BonusBuyWidgetStylePreset[]
  activePresetId: number | null
  onSelectPreset: (presetId: number) => void
  compact?: boolean
}

const RootStack = styled(Stack, {
  shouldForwardProp: (prop) => prop !== 'compact',
})<{ compact?: boolean }>(({ theme, compact }) => ({
  gap: compact ? theme.spacing(0.75) : theme.spacing(1),
}))

const Title = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'compact',
})<{ compact?: boolean }>(({ compact }) => ({
  fontWeight: 600,
  ...(compact
    ? {
        fontSize: '0.8125rem',
        lineHeight: 1.3,
      }
    : {}),
}))

const PresetGrid = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'compact',
})<{ compact?: boolean }>(({ theme, compact }) => ({
  display: 'grid',
  gap: compact ? theme.spacing(0.75) : theme.spacing(1),
  gridTemplateColumns: compact
    ? 'repeat(auto-fill, minmax(112px, 1fr))'
    : 'repeat(2, minmax(0, 1fr))',
  ...(!compact && {
    [theme.breakpoints.up('sm')]: {
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    },
  }),
}))

const PresetChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'compact',
})<{ compact?: boolean }>(({ compact }) => ({
  width: '100%',
  height: compact ? 28 : 36,
  justifyContent: 'flex-start',
  backgroundColor: 'transparent',
  '& .MuiChip-label': {
    paddingLeft: compact ? 6 : 8,
    paddingRight: compact ? 6 : 8,
    overflow: 'hidden',
    fontSize: compact ? '0.75rem' : undefined,
  },
}))

const ChipLabelStack = styled(Stack, {
  shouldForwardProp: (prop) => prop !== 'compact',
})<{ compact?: boolean }>(({ compact }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: compact ? 4 : 6,
  minWidth: 0,
}))

const PreviewDot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'compact',
})<{ compact?: boolean }>(({ theme, compact }) => ({
  width: compact ? 8 : 10,
  height: compact ? 8 : 10,
  borderRadius: '50%',
  border: '1px solid',
  borderColor: theme.palette.divider,
  flexShrink: 0,
}))

const PreviewDotsRow = styled(Stack, {
  shouldForwardProp: (prop) => prop !== 'compact',
})<{ compact?: boolean }>(({ compact }) => ({
  flexDirection: 'row',
  gap: compact ? 3 : 4,
  marginLeft: compact ? 2 : 4,
  flexShrink: 0,
}))

function PreviewDots({
  colors,
  compact,
}: {
  colors: [string, string, string]
  compact?: boolean
}) {
  return (
    <PreviewDotsRow compact={compact}>
      {colors.map((color) => (
        <PreviewDot key={color} compact={compact} sx={{ bgcolor: color }} />
      ))}
    </PreviewDotsRow>
  )
}

export function WidgetThemePresetPicker({
  presets,
  activePresetId,
  onSelectPreset,
  compact = false,
}: WidgetThemePresetPickerProps) {
  return (
    <RootStack compact={compact}>
      <Title variant="subtitle2" compact={compact}>
        Theme preset
      </Title>
      <PresetGrid compact={compact}>
        {presets.map((preset) => {
          const selected = activePresetId === preset.id

          return (
            <PresetChip
              key={preset.id}
              compact={compact}
              label={
                <ChipLabelStack compact={compact}>
                  <Box
                    component="span"
                    sx={{
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getBonusBuyWidgetPresetDisplayName(preset)}
                  </Box>
                  <PreviewDots
                    colors={getPresetPreviewDots(preset.styleSettings)}
                    compact={compact}
                  />
                </ChipLabelStack>
              }
              onClick={() => onSelectPreset(preset.id)}
              variant="outlined"
              color={selected ? 'primary' : 'default'}
            />
          )
        })}
      </PresetGrid>
    </RootStack>
  )
}
