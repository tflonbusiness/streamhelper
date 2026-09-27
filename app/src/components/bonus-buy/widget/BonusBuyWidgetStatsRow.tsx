import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral'
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt'
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied'
import { formatBonusBuyMoney } from '@/lib/bonus-buy-format'
import type { BonusBuySessionStats } from '@/lib/bonus-buy-stats'
import type {
  AverageXSentiment,
  BonusBuyWidgetTheme,
} from '@/lib/bonus-buy-widget-presentation'
import {
  StyledAccentIcon,
  StyledAverageXIcon,
  StyledAverageXValue,
  StyledStatCellFlex,
  StyledStatDivider,
  StyledStatValue,
  StyledStatValueProfit,
  StyledStatValuesGroup,
  StyledStatsRow,
  StyledWidgetCell,
} from '@/components/bonus-buy/widget/bonus-buy-widget-styles'

const AVERAGE_X_ICONS: Record<
  AverageXSentiment,
  typeof SentimentNeutralIcon
> = {
  dissatisfied: SentimentVeryDissatisfiedIcon,
  neutral: SentimentNeutralIcon,
  satisfied: SentimentSatisfiedAltIcon,
}

type BonusBuyWidgetStatsRowProps = {
  stats: BonusBuySessionStats
  theme: BonusBuyWidgetTheme
  currencyCode: string
  averageXColor: string
  averageXSentiment: AverageXSentiment
}

export function BonusBuyWidgetStatsRow({
  stats,
  theme,
  currencyCode,
  averageXColor,
  averageXSentiment,
}: BonusBuyWidgetStatsRowProps) {
  const AverageXIcon = AVERAGE_X_ICONS[averageXSentiment]
  const profitValue = Number.parseFloat(stats.profit)
  const showProfit = profitValue !== 0

  return (
    <StyledStatsRow>
      <StyledStatCellFlex widgetTheme={theme} cellHeight={54}>
        <StyledAccentIcon textColor={theme.accentColor} aria-hidden />
        <StyledStatValuesGroup>
          <StyledStatValue>
            {formatBonusBuyMoney(stats.spent, currencyCode)}
          </StyledStatValue>
          {showProfit ? (
            <>
              <StyledStatDivider aria-hidden>/</StyledStatDivider>
              <StyledStatValueProfit textColor={averageXColor}>
                {formatBonusBuyMoney(stats.profit, currencyCode)}
              </StyledStatValueProfit>
            </>
          ) : null}
        </StyledStatValuesGroup>
      </StyledStatCellFlex>
      <StyledWidgetCell widgetTheme={theme} cellHeight={54}>
        <StyledAverageXIcon textColor={averageXColor} aria-hidden>
          <AverageXIcon />
        </StyledAverageXIcon>
        <StyledAverageXValue textColor={averageXColor}>
          {stats.averageX}
        </StyledAverageXValue>
      </StyledWidgetCell>
    </StyledStatsRow>
  )
}
