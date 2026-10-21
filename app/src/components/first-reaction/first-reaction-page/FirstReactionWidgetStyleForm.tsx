import { Grid, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { HexColorField } from '@/components/bonus-buy/HexColorField'
import type { FirstReactionWidgetStyle } from '@/lib/first-reaction-widget-style-defaults'

const BOLT_COLOR_FIELDS: ReadonlyArray<
  readonly [keyof FirstReactionWidgetStyle, string]
> = [
  ['boltFillStart', 'firstReaction.widgetColorBoltFillStart'],
  ['boltFillEnd', 'firstReaction.widgetColorBoltFillEnd'],
  ['boltStroke', 'firstReaction.widgetColorBoltStroke'],
  ['boltGlow', 'firstReaction.widgetColorBoltGlow'],
]

const TEXT_COLOR_FIELDS: ReadonlyArray<
  readonly [keyof FirstReactionWidgetStyle, string]
> = [
  ['textHint', 'firstReaction.widgetColorTextHint'],
  ['textKeyword', 'firstReaction.widgetColorTextKeyword'],
  ['textTimer', 'firstReaction.widgetColorTextTimer'],
]

type FirstReactionWidgetStyleFormProps = {
  draft: FirstReactionWidgetStyle
  onUpdate: <K extends keyof FirstReactionWidgetStyle>(
    key: K,
    value: FirstReactionWidgetStyle[K],
  ) => void
}

export function FirstReactionWidgetStyleForm({
  draft,
  onUpdate,
}: FirstReactionWidgetStyleFormProps) {
  const { t } = useTranslation()

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {t('firstReaction.widgetColorsTitle')}
      </Typography>

      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {t('firstReaction.widgetColorsBolt')}
      </Typography>
      <Grid container spacing={2}>
        {BOLT_COLOR_FIELDS.map(([key, labelKey]) => (
          <Grid key={key} size={{ xs: 12, sm: 6 }}>
            <HexColorField
              label={t(labelKey)}
              value={draft[key] as string}
              onChange={(value) => onUpdate(key, value)}
            />
          </Grid>
        ))}
      </Grid>

      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {t('firstReaction.widgetColorsText')}
      </Typography>
      <Grid container spacing={2}>
        {TEXT_COLOR_FIELDS.map(([key, labelKey]) => (
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
