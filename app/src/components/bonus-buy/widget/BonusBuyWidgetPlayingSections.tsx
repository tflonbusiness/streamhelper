import type { BonusBuySlot } from '@/api/bonus-buy'
import { formatUsd } from '@/lib/bonus-buy-format'
import type { BonusBuyWidgetTheme } from '@/lib/bonus-buy-widget-presentation'
import {
  StyledBestWinAmount,
  StyledBestWinInfo,
  StyledBestWinName,
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
  StyledPremiumIcon,
  StyledWidgetCell,
} from '@/components/bonus-buy/widget/bonus-buy-widget-styles'

type BonusBuyWidgetPlayingSectionsProps = {
  playingSlot: BonusBuySlot
  playingIndex: number
  theme: BonusBuyWidgetTheme
}

export function BonusBuyWidgetPlayingSections({
  playingSlot,
  playingIndex,
  theme,
}: BonusBuyWidgetPlayingSectionsProps) {
  return (
    <>
      {playingSlot.winAmount !== null ? (
        <StyledWidgetCell widgetTheme={theme} cellHeight={68}>
          <StyledPremiumIcon textColor={theme.accentColor} aria-hidden />
          <StyledBestWinInfo>
            <StyledBestWinName>{playingSlot.name}</StyledBestWinName>
            <StyledBestWinProvider textColor={theme.textMutedColor}>
              {playingSlot.providerName ?? '—'}
            </StyledBestWinProvider>
          </StyledBestWinInfo>
          <StyledBestWinAmount>{formatUsd(playingSlot.winAmount)}</StyledBestWinAmount>
        </StyledWidgetCell>
      ) : null}

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
            {formatUsd(playingSlot.purchaseAmount)}
          </StyledLivePurchase>
        </StyledLiveContentRow>
        <StyledLiveBadge liveColor={theme.liveColor}>
          <StyledLiveDot liveColor={theme.liveColor} />
          <StyledLiveLabel>LIVE</StyledLiveLabel>
        </StyledLiveBadge>
      </StyledLiveCell>
    </>
  )
}
