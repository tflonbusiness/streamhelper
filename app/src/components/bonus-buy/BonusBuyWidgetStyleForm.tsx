import { Grid, Stack, TextField, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { BonusBuyWidgetSettings } from '@/api/bonus-buy'
import { HexColorField } from '@/components/bonus-buy/HexColorField'
import { inputFieldSx } from '@/theme/colors'

const COLOR_FIELDS: ReadonlyArray<
  readonly [keyof BonusBuyWidgetSettings, string]
> = [
  ['backgroundColor', 'common.background'],
  ['surfaceColor', 'common.surface'],
  ['borderColor', 'common.border'],
  ['accentColor', 'common.accent'],
  ['positiveColor', 'common.positive'],
  ['negativeColor', 'common.negative'],
  ['liveColor', 'common.colorLive'],
  ['textMutedColor', 'common.textMuted'],
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
  const { t } = useTranslation()

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {t('common.size')}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={t('common.widthPx')}
            type="number"
            value={draft.width}
            onChange={(event) => onUpdate('width', parsePositiveInt(event.target.value))}
            fullWidth
            sx={inputFieldSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={t('common.heightPx')}
            type="number"
            value={draft.height}
            onChange={(event) => onUpdate('height', parsePositiveInt(event.target.value))}
            fullWidth
            sx={inputFieldSx}
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {t('common.colors')}
      </Typography>
      <Grid container spacing={2}>
        {COLOR_FIELDS.map(([key, labelKey]) => (
          <Grid key={key} size={{ xs: 12, sm: 6 }}>
            <HexColorField
              label={t(labelKey)}
              value={draft[key] as string}
              onChange={(nextValue) => onUpdate(key, nextValue)}
            />
          </Grid>
        ))}
      </Grid>

      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {t('common.shape')}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={t('common.borderRadiusPx')}
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
            label={t('common.paddingPx')}
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
        {t('common.typography')}
      </Typography>
      <TextField
        label={t('common.fontFamily')}
        value={draft.fontFamily}
        onChange={(event) => onUpdate('fontFamily', event.target.value)}
        fullWidth
        sx={inputFieldSx}
      />
    </Stack>
  )
}
