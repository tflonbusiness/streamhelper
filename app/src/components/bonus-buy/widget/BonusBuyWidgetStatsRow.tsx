import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral'
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt'
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied'
import { formatUsd } from '@/lib/bonus-buy-format'
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
  StyledStatValue,
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
  averageXColor: string
  averageXSentiment: AverageXSentiment
}

export function BonusBuyWidgetStatsRow({
  stats,
  theme,
  averageXColor,
  averageXSentiment,
}: BonusBuyWidgetStatsRowProps) {
  const AverageXIcon = AVERAGE_X_ICONS[averageXSentiment]

  return (
    <StyledStatsRow>
      <StyledStatCellFlex widgetTheme={theme} cellHeight={54}>
        <StyledAccentIcon textColor={theme.accentColor} aria-hidden />
        <StyledStatValue>{formatUsd(stats.totalWin)}</StyledStatValue>
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
