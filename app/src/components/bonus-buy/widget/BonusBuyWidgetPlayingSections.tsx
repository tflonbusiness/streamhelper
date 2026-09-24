import type { BonusBuySlot } from '@/api/bonus-buy'
import { formatBonusBuyMoney } from '@/lib/bonus-buy-format'
import type { BonusBuyWidgetTheme } from '@/lib/bonus-buy-widget-presentation'
import {
  StyledBestWinProvider,
  StyledLiveAccentBar,
  StyledLiveBadge,
  StyledLiveCell,
  StyledLiveContentRow,
  StyledLiveDot,
  StyledLiveInfo,
  StyledLiveLabel,
  StyledLiveName,
  StyledLivePurchase,
} from '@/components/bonus-buy/widget/bonus-buy-widget-styles'

type BonusBuyWidgetPlayingSectionsProps = {
  playingSlot: BonusBuySlot
  playingIndex: number
  theme: BonusBuyWidgetTheme
  currencyCode: string
}

export function BonusBuyWidgetPlayingSections({
  playingSlot,
  playingIndex,
  theme,
  currencyCode,
}: BonusBuyWidgetPlayingSectionsProps) {
  return (
    <StyledLiveCell widgetTheme={theme} cellHeight={68}>
      <StyledLiveAccentBar textColor={theme.accentColor} />
      <StyledLiveContentRow>
        <StyledLiveInfo>
          <StyledLiveName textColor={theme.accentColor}>
            {playingIndex + 1}. {playingSlot.name}
          </StyledLiveName>
          <StyledBestWinProvider textColor={theme.textMutedColor}>
            {playingSlot.providerName ?? '—'}
          </StyledBestWinProvider>
        </StyledLiveInfo>
        <StyledLivePurchase textColor={theme.textMutedColor}>
          {formatBonusBuyMoney(playingSlot.purchaseAmount, currencyCode)}
        </StyledLivePurchase>
      </StyledLiveContentRow>
      <StyledLiveBadge liveColor={theme.liveColor}>
        <StyledLiveDot liveColor={theme.liveColor} />
        <StyledLiveLabel>LIVE</StyledLiveLabel>
      </StyledLiveBadge>
    </StyledLiveCell>
  )
}
