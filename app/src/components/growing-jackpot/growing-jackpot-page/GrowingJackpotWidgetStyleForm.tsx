import { Grid, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { HexColorField } from '@/components/bonus-buy/HexColorField'
import type { GrowingJackpotWidgetStyle } from '@/lib/growing-jackpot-widget-style-defaults'

const COLOR_FIELDS: ReadonlyArray<
  readonly [keyof GrowingJackpotWidgetStyle, string]
> = [
  ['prizeText', 'growingJackpot.widgetColorPrizeText'],
  ['prizeTextDim', 'growingJackpot.widgetColorPrizeTextDim'],
  ['keywordText', 'growingJackpot.widgetColorKeywordText'],
  ['timerText', 'growingJackpot.widgetColorTimerText'],
]

type GrowingJackpotWidgetStyleFormProps = {
  draft: GrowingJackpotWidgetStyle
  onUpdate: <K extends keyof GrowingJackpotWidgetStyle>(
    key: K,
    value: GrowingJackpotWidgetStyle[K],
  ) => void
}

export function GrowingJackpotWidgetStyleForm({
  draft,
  onUpdate,
}: GrowingJackpotWidgetStyleFormProps) {
  const { t } = useTranslation()

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {t('growingJackpot.widgetColorsTitle')}
      </Typography>
      <Grid container spacing={2}>
        {COLOR_FIELDS.map(([key, labelKey]) => (
          <Grid key={key} size={{ xs: 12, sm: 6 }}>
            <HexColorField
              label={t(labelKey)}
              value={draft[key] as string}
              onChange={(value) => onUpdate(key, value)}
            />
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
