import { Grid, Stack, TextField, Typography } from '@mui/material'
import type { BonusBuyWidgetSettings } from '@/api/bonus-buy'
import { HexColorField } from '@/components/bonus-buy/HexColorField'
import { inputFieldSx } from '@/theme/colors'

const COLOR_FIELDS: ReadonlyArray<
  readonly [keyof BonusBuyWidgetSettings, string]
> = [
  ['backgroundColor', 'Background'],
  ['surfaceColor', 'Surface'],
  ['borderColor', 'Border'],
  ['accentColor', 'Accent'],
  ['positiveColor', 'Positive'],
  ['negativeColor', 'Negative'],
  ['liveColor', 'Live'],
  ['textMutedColor', 'Text muted'],
]

type BonusBuyWidgetStyleFormProps = {
  draft: BonusBuyWidgetSettings
  onUpdate: <K extends keyof BonusBuyWidgetSettings>(
    key: K,
    value: BonusBuyWidgetSettings[K],
  ) => void
}

function parsePositiveInt(value: string): number {
  return Number.parseInt(value, 10) || 0
}

export function BonusBuyWidgetStyleForm({
  draft,
  onUpdate,
}: BonusBuyWidgetStyleFormProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Size
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Width (px)"
            type="number"
            value={draft.width}
            onChange={(event) => onUpdate('width', parsePositiveInt(event.target.value))}
            fullWidth
            sx={inputFieldSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Height (px)"
            type="number"
            value={draft.height}
            onChange={(event) => onUpdate('height', parsePositiveInt(event.target.value))}
            fullWidth
            sx={inputFieldSx}
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Colors
      </Typography>
      <Grid container spacing={2}>
        {COLOR_FIELDS.map(([key, label]) => (
          <Grid key={key} size={{ xs: 12, sm: 6 }}>
            <HexColorField
              label={label}
              value={draft[key] as string}
              onChange={(nextValue) => onUpdate(key, nextValue)}
            />
          </Grid>
        ))}
      </Grid>

      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Shape
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Border radius (px)"
            type="number"
            value={draft.borderRadius}
            onChange={(event) =>
              onUpdate('borderRadius', parsePositiveInt(event.target.value))
            }
            fullWidth
            sx={inputFieldSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Padding (px)"
            type="number"
            value={draft.padding}
            onChange={(event) =>
              onUpdate('padding', parsePositiveInt(event.target.value))
            }
            fullWidth
            sx={inputFieldSx}
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Typography
      </Typography>
      <TextField
        label="Font family"
        value={draft.fontFamily}
        onChange={(event) => onUpdate('fontFamily', event.target.value)}
        fullWidth
        sx={inputFieldSx}
      />
    </Stack>
  )
}
