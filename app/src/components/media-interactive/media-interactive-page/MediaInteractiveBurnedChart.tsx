import { Box, Tooltip, Typography } from '@mui/material'
import { alpha, styled, useTheme } from '@mui/material/styles'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { MediaInteractiveBurnedDailyPoint } from '@/api/media-interactive'

type MediaInteractiveBurnedChartProps = {
  dailySeries: MediaInteractiveBurnedDailyPoint[]
  loading?: boolean
}

const CHART_HEIGHT = 140
const BAR_GAP = 2

const StyledChartRoot = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
}))

const StyledPlot = styled(Box)({
  display: 'flex',
  alignItems: 'flex-end',
  gap: BAR_GAP,
  height: CHART_HEIGHT,
  width: '100%',
})

const StyledBarButton = styled('button', {
  shouldForwardProp: (prop) => prop !== 'barHeight' && prop !== 'active',
})<{ barHeight: number; active?: boolean }>(
  ({ theme, barHeight, active }) => ({
    flex: 1,
    minWidth: 0,
    height: `${barHeight}%`,
    minHeight: barHeight > 0 ? 4 : 0,
    padding: 0,
    border: 'none',
    borderRadius: theme.spacing(0.5),
    cursor: 'default',
    backgroundColor: active
      ? theme.palette.warning.main
      : alpha(theme.palette.warning.main, 0.72),
    transition: 'background-color 0.15s ease, transform 0.15s ease',
    '&:hover': {
      backgroundColor: theme.palette.warning.main,
      transform: 'translateY(-1px)',
    },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.warning.light}`,
      outlineOffset: 2,
    },
  }),
)

const StyledAxis = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: theme.spacing(0.75),
  paddingLeft: 0,
  paddingRight: 0,
}))


export function MediaInteractiveBurnedChart({
  dailySeries,
  loading,
}: MediaInteractiveBurnedChartProps) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const dateLocale = i18n.language.startsWith('ru') ? 'ru' : 'en'

  const maxBurned = useMemo(
    () => Math.max(1, ...dailySeries.map((d) => d.burnedTotal)),
    [dailySeries],
  )

  const axisLabels = useMemo(() => {
    if (dailySeries.length === 0) return []
    const first = dailySeries[0]
    const mid = dailySeries[Math.floor(dailySeries.length / 2)]
    const last = dailySeries[dailySeries.length - 1]
    return [first, mid, last]
  }, [dailySeries])

  if (loading) {
    return (
      <StyledChartRoot>
        <Box
          sx={{
            height: CHART_HEIGHT,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.text.primary, 0.04),
          }}
        />
      </StyledChartRoot>
    )
  }

  return (
    <StyledChartRoot>
      <Typography
        variant="caption"
        color="text.secondary"
        component="p"
        sx={{ mb: 1, m: 0 }}
      >
        {t('mediaInteractive.burnedChartCaption')}
      </Typography>
      <StyledPlot
        role="img"
        aria-label={t('mediaInteractive.burnedChartAria', {
          total: dailySeries.reduce((s, d) => s + d.burnedTotal, 0),
        })}
      >
        {dailySeries.map((point) => {
          const barHeight = (point.burnedTotal / maxBurned) * 100
          const dateLabel = dayjs(point.date).locale(dateLocale).format('D MMM')
          const label = t('mediaInteractive.burnedChartTooltip', {
            date: dateLabel,
            points: point.burnedTotal.toLocaleString(),
            count: point.orderCount,
          })
          return (
            <Tooltip key={point.date} title={label} placement="top" arrow>
              <StyledBarButton
                type="button"
                barHeight={barHeight}
                aria-label={label}
              />
            </Tooltip>
          )
        })}
      </StyledPlot>
      <StyledAxis aria-hidden>
        {axisLabels.map((point) => (
          <Typography key={point.date} variant="caption" color="text.secondary">
            {dayjs(point.date).locale(dateLocale).format('D MMM')}
          </Typography>
        ))}
      </StyledAxis>
    </StyledChartRoot>
  )
}
