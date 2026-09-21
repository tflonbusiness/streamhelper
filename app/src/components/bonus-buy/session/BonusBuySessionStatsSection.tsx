import { Card, Grid, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { styled } from '@mui/material/styles'
import type { BonusBuyRecord } from '@/api/bonus-buy'
import type { BonusBuySessionStats } from '@/lib/bonus-buy-stats'
import {
  formatUsd,
  parseAverageX,
  signedValueColor,
} from '@/components/bonus-buy/session/bonus-buy-session-utils'
import { StyledSessionStatCardContent } from '@/components/bonus-buy/session/bonusBuySessionStyles'
import { cardSx } from '@/theme/colors'

type BonusBuySessionStatsSectionProps = {
  record: BonusBuyRecord
  stats: BonusBuySessionStats
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

  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard label="Start balance" value={formatUsd(props.record.startBalance)} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          label="Current balance"
          value={formatUsd(props.stats.currentBalance)}
          valueColor={signedValueColor(currentBalanceValue, theme)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard label="Spent" value={formatUsd(props.stats.spent)} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          label="Profit"
          value={formatUsd(props.stats.profit)}
          valueColor={signedValueColor(profitValue, theme)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          label="Average X"
          value={props.stats.averageX}
          valueColor={signedValueColor(averageXValue, theme)}
        />
      </Grid>
    </Grid>
  )
}
