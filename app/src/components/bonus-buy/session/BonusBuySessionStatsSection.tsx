import { Card, Grid, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { styled } from '@mui/material/styles'
import type { BonusBuyRecord } from '@/api/bonus-buy'
import type { BonusBuySessionStats } from '@/lib/bonus-buy-stats'
import {
  DEFAULT_AVERAGE_X_COLOR_THEME,
  getAverageXPresentation,
} from '@/lib/bonus-buy-widget-presentation'
import {
  formatBonusBuyMoney,
  parseAverageX,
  signedValueColor,
} from '@/components/bonus-buy/session/bonus-buy-session-utils'
import { StyledSessionStatCardContent } from '@/components/bonus-buy/session/bonusBuySessionStyles'
import { cardSx } from '@/theme/colors'

type BonusBuySessionStatsSectionProps = {
  record: BonusBuyRecord
  stats: BonusBuySessionStats
  averageXPositiveColor?: string
}

type StatCardProps = {
  label: string
  value: string
  valueColor?: string
}

const StatLabel = styled(Typography)(({ theme }) => ({
  display: 'block',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}))

const StatValue = styled(Typography)({
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
})

const StatValueRow = styled(Stack)({
  alignItems: 'center',
  justifyContent: 'space-between',
})

function StatCard(props: StatCardProps) {
  return (
    <Card elevation={0} sx={cardSx}>
      <StyledSessionStatCardContent>
        <StatLabel variant="caption">{props.label}</StatLabel>
        <StatValueRow direction="row" spacing={1}>
          <StatValue variant="h6" sx={{ color: props.valueColor ?? 'inherit' }}>
            {props.value}
          </StatValue>
        </StatValueRow>
      </StyledSessionStatCardContent>
    </Card>
  )
}

export const BonusBuySessionStatsSection = (
  props: BonusBuySessionStatsSectionProps,
) => {
  const theme = useTheme()
  const profitValue = Number.parseFloat(props.stats.profit)
  const currentBalanceValue = Number.parseFloat(props.stats.currentBalance)
  const averageXValue = parseAverageX(props.stats.averageX)
  const { color: averageXColor } = getAverageXPresentation(averageXValue, {
    positiveColor:
      props.averageXPositiveColor ?? DEFAULT_AVERAGE_X_COLOR_THEME.positiveColor,
    negativeColor: theme.palette.error.main,
  })

  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          label="Start balance"
          value={formatBonusBuyMoney(
            props.record.startBalance,
            props.record.currencyCode,
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          label="Current balance"
          value={formatBonusBuyMoney(
            props.stats.currentBalance,
            props.record.currencyCode,
          )}
          valueColor={signedValueColor(currentBalanceValue, theme)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          label="Spent"
          value={formatBonusBuyMoney(props.stats.spent, props.record.currencyCode)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          label="Profit"
          value={formatBonusBuyMoney(props.stats.profit, props.record.currencyCode)}
          valueColor={signedValueColor(profitValue, theme)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          label="Average X"
          value={props.stats.averageX}
          valueColor={averageXColor}
        />
      </Grid>
    </Grid>
  )
}
