import type { BonusBuySlot } from '@/api/bonus-buy'
import { formatBonusBuyMoney } from '@/lib/bonus-buy-format'
import type { BonusBuyWidgetTheme } from '@/lib/bonus-buy-widget-presentation'
import {
  StyledBestWinProvider,
  StyledLiveAccentBar,
  StyledLiveBadge,
  StyledLiveCell,
  StyledLiveContentRow,
  StyledLivePulseIcon,
  StyledLiveInfo,
  StyledLiveLabel,
  StyledLiveName,
  StyledLivePurchase,
} from '@/components/bonus-buy/widget/bonus-buy-widget-styles'
import { getWidgetProviderLabel } from '@/components/bonus-buy/widget/bonus-buy-widget-slot-utils'

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
  const providerLabel = getWidgetProviderLabel(playingSlot.providerName)

  return (
    <StyledLiveCell widgetTheme={theme} cellHeight={68}>
      <StyledLiveAccentBar textColor={theme.accentColor} />
      <StyledLiveContentRow>
        <StyledLiveInfo titleOnlyCentered={providerLabel === null}>
          <StyledLiveName textColor={theme.accentColor}>
            {playingIndex + 1}. {playingSlot.name}
          </StyledLiveName>
          {providerLabel ? (
            <StyledBestWinProvider textColor={theme.textMutedColor}>
              {providerLabel}
            </StyledBestWinProvider>
          ) : null}
        </StyledLiveInfo>
        <StyledLivePurchase textColor={theme.textMutedColor}>
          {formatBonusBuyMoney(playingSlot.purchaseAmount, currencyCode)}
        </StyledLivePurchase>
      </StyledLiveContentRow>
      <StyledLiveBadge liveColor={theme.liveColor}>
        <StyledLivePulseIcon aria-hidden />
        <StyledLiveLabel>LIVE</StyledLiveLabel>
      </StyledLiveBadge>
    </StyledLiveCell>
  )
}
