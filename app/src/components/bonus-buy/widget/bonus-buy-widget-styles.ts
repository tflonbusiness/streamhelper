import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import { Box, Typography } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import type { BonusBuyWidgetTheme } from '@/lib/bonus-buy-widget-presentation'

export const BORDER_SUBTLE = 'rgba(255,255,255,0.12)'

type WidgetThemeProp = {
  widgetTheme: BonusBuyWidgetTheme
}

type CellHeightProp = {
  cellHeight: number
}

type TextColorProp = {
  textColor: string
}

const widgetThemeProps = {
  shouldForwardProp: (prop: string) => prop !== 'widgetTheme',
}

const cellProps = {
  shouldForwardProp: (prop: string) =>
    prop !== 'widgetTheme' && prop !== 'cellHeight',
}

const textColorProps = {
  shouldForwardProp: (prop: string) => prop !== 'textColor',
}

export const StyledWidgetCard = styled(Box, widgetThemeProps)<WidgetThemeProp>(
  ({ widgetTheme }) => ({
    width: widgetTheme.width,
    height: widgetTheme.height,
    minWidth: widgetTheme.width,
    minHeight: widgetTheme.height,
    maxWidth: widgetTheme.width,
    maxHeight: widgetTheme.height,
    backgroundColor: widgetTheme.backgroundColor,
    border: `1px solid ${widgetTheme.borderColor}`,
    borderRadius: `${widgetTheme.borderRadius}px`,
    padding: `${widgetTheme.padding}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflow: 'hidden',
    fontFamily: widgetTheme.fontFamily,
    flexShrink: 0,
    boxSizing: 'border-box',
  }),
)

export const StyledWidgetCell = styled(Box, cellProps)<
  WidgetThemeProp & CellHeightProp
>(({ widgetTheme, cellHeight }) => ({
  backgroundColor: widgetTheme.surfaceColor,
  border: `1px solid ${BORDER_SUBTLE}`,
  borderRadius: '12px',
  height: cellHeight,
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '14px',
  paddingRight: '14px',
  paddingTop: '6px',
  paddingBottom: '6px',
}))

export const StyledWidgetHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBottom: 8,
  borderBottom: '2px solid #1F1F24',
  minHeight: 55,
})

export const StyledHeaderLeft = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
})

export const StyledHeaderIconWrap = styled(Box, textColorProps)<TextColorProp>(
  ({ textColor }) => ({
    width: 42,
    height: 42,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: textColor,
  }),
)

export const StyledHeaderGiftIcon = styled(CardGiftcardIcon)({
  fontSize: 28,
})

export const StyledHeaderTitle = styled(Typography)({
  fontWeight: 600,
  fontSize: '28px',
  lineHeight: '40px',
  color: '#FFFFFF',
  letterSpacing: '1px',
  textTransform: 'capitalize',
})

export const StyledSlotCountPill = styled(Box, widgetThemeProps)<WidgetThemeProp>(
  ({ widgetTheme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: widgetTheme.surfaceColor,
    border: `1px solid ${widgetTheme.borderColor}`,
    borderRadius: '8px',
    paddingLeft: '8px',
    paddingRight: '8px',
    paddingTop: '4px',
    paddingBottom: '4px',
  }),
)

export const StyledSlotCountIcon = styled(CardGiftcardIcon, textColorProps)<
  TextColorProp
>(({ textColor }) => ({
  fontSize: 22,
  color: textColor,
}))

export const StyledSlotCountValue = styled(Typography)({
  fontWeight: 600,
  fontSize: '22px',
  lineHeight: '30px',
  color: '#FFFFFF',
  letterSpacing: '1px',
})

export const StyledStatsRow = styled(Box)({
  display: 'flex',
  gap: '12px',
})

export const StyledStatCellFlex = styled(StyledWidgetCell)({
  flex: 1,
})

export const StyledAccentIcon = styled(ShoppingCartIcon, textColorProps)<
  TextColorProp
>(({ textColor }) => ({
  fontSize: 36,
  color: textColor,
}))

export const StyledStatValue = styled(Typography)({
  marginLeft: '10px',
  fontWeight: 600,
  fontSize: '26px',
  color: '#FFFFFF',
})

export const StyledAverageXIcon = styled('span', textColorProps)<TextColorProp>(
  ({ textColor }) => ({
    display: 'inline-flex',
    fontSize: 36,
    color: textColor,
    '& svg': {
      fontSize: 36,
    },
  }),
)

export const StyledAverageXValue = styled(Typography, textColorProps)<
  TextColorProp
>(({ textColor }) => ({
  marginLeft: '10px',
  fontWeight: 600,
  fontSize: '28px',
  color: textColor,
}))

export const StyledPremiumIcon = styled(WorkspacePremiumIcon, textColorProps)<
  TextColorProp
>(({ textColor }) => ({
  fontSize: 36,
  color: textColor,
}))

export const StyledBestWinInfo = styled(Box)({
  flex: 1,
  marginLeft: '10px',
  minWidth: 0,
})

export const StyledBestWinName = styled(Typography)({
  fontWeight: 600,
  fontSize: '22px',
  color: '#FFFFFF',
  lineHeight: 1.2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const StyledMutedText = styled(Typography, textColorProps)<TextColorProp>(
  ({ textColor }) => ({
    fontSize: '18px',
    color: textColor,
  }),
)

export const StyledBestWinProvider = styled(StyledMutedText)({
  lineHeight: 1.2,
})

export const StyledBestWinAmount = styled(Typography)({
  fontWeight: 600,
  fontSize: '26px',
  color: '#FFFFFF',
  flexShrink: 0,
  marginLeft: 8,
})

const BEST_X_VALUE_FLIP_DURATION_S = 8

export const StyledBestXValueViewport = styled(Box)({
  flexShrink: 0,
  marginLeft: 8,
  height: 32,
  overflow: 'hidden',
  minWidth: 72,
  textAlign: 'right',
})

export const StyledBestXValueTrack = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  animation: `bonusBuyBestXValueFlip ${BEST_X_VALUE_FLIP_DURATION_S}s ease-in-out infinite`,
  '@keyframes bonusBuyBestXValueFlip': {
    '0%, 45%': { transform: 'translateY(0)' },
    '50%, 95%': { transform: 'translateY(-50%)' },
    '100%': { transform: 'translateY(0)' },
  },
})

export const StyledBestXValueItem = styled(Typography, textColorProps)<TextColorProp>(
  ({ textColor }) => ({
    height: 32,
    lineHeight: '32px',
    fontWeight: 600,
    fontSize: '26px',
    color: textColor,
    flexShrink: 0,
  }),
)

export const StyledLiveCell = styled(StyledWidgetCell)({
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0px 12px 32px -4px rgba(0,0,0,0.85)',
  borderColor: 'rgba(255,255,255,0.15)',
  paddingLeft: '22px',
  paddingRight: '13px',
})

export const StyledLiveAccentBar = styled(Box, textColorProps)<TextColorProp>(
  ({ textColor }) => ({
    position: 'absolute',
    left: 0,
    top: -2,
    bottom: -1,
    width: 8,
    backgroundColor: textColor,
    boxShadow: `0 0 12px ${textColor}`,
  }),
)

export const StyledLiveContentRow = styled(Box)({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 16,
})

export const StyledLiveInfo = styled(Box)({
  flex: 1,
  minWidth: 0,
})

export const StyledLiveName = styled(Typography, textColorProps)<TextColorProp>(
  ({ textColor }) => ({
    fontWeight: 600,
    fontSize: '22px',
    color: textColor,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
)

export const StyledLivePurchase = styled(StyledMutedText)({
  flexShrink: 0,
  fontSize: '22px',
  fontWeight: 500,
})

export const StyledLiveBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'liveColor',
})<{ liveColor: string }>(({ liveColor }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  backgroundColor: alpha(liveColor, 0.08),
  border: `1px solid ${alpha(liveColor, 0.4)}`,
  borderRadius: '10px',
  paddingLeft: '10px',
  paddingRight: '10px',
  paddingTop: '4px',
  paddingBottom: '4px',
  flexShrink: 0,
  marginLeft: 18,
}))

export const StyledLiveDot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'liveColor',
})<{ liveColor: string }>(({ liveColor }) => ({
  width: 10,
  height: 10,
  borderRadius: '50%',
  backgroundColor: liveColor,
}))

export const StyledLiveLabel = styled(Typography)({
  fontWeight: 800,
  fontSize: '14px',
  letterSpacing: '1.2px',
  color: '#FFFFFF',
})

export const StyledSlotRow = styled(StyledWidgetCell)({
  justifyContent: 'space-between',
  gap: 18,
  flexShrink: 0,
  paddingLeft: '16px',
  paddingRight: '16px',
  paddingTop: '8px',
  paddingBottom: '8px',
})

export const StyledSlotInfo = styled(Box)({
  minWidth: 0,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '1px',
})

export const StyledSlotName = styled(Typography)({
  fontSize: '22px',
  fontWeight: 500,
  lineHeight: 1.15,
  color: '#FFFFFF',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const StyledSlotProvider = styled(Typography, textColorProps)<TextColorProp>(
  ({ textColor }) => ({
    fontSize: '16px',
    lineHeight: 1.1,
    color: textColor,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
)

export const StyledPurchaseAmount = styled(StyledMutedText)({
  flexShrink: 0,
})

export const StyledWinAmount = styled(Typography, textColorProps)<TextColorProp>(
  ({ textColor }) => ({
    fontSize: '18px',
    color: textColor,
    flexShrink: 0,
    minWidth: 56,
    textAlign: 'right',
  }),
)

export const StyledMultiplierBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'badgeColor',
})<{ badgeColor: string }>(({ badgeColor }) => ({
  backgroundColor: alpha(badgeColor, 0.08),
  border: `1px solid ${alpha(badgeColor, 0.3)}`,
  borderRadius: '8px',
  paddingLeft: '12px',
  paddingRight: '12px',
  paddingTop: '8px',
  paddingBottom: '8px',
  flexShrink: 0,
}))

export const StyledMultiplierValue = styled(Typography, textColorProps)<
  TextColorProp
>(({ textColor }) => ({
  fontWeight: 600,
  fontSize: '16px',
  color: textColor,
  lineHeight: '28px',
}))

export const StyledSlotListContainer = styled(Box)({
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
  paddingTop: 4,
  paddingBottom: 4,
  maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
})

export const StyledSlotScrollTrack = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== 'autoScrollEnabled' && prop !== 'autoScrollDuration',
})<{ autoScrollEnabled: boolean; autoScrollDuration: number }>(
  ({ autoScrollEnabled, autoScrollDuration }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    ...(autoScrollEnabled
      ? {
          '@keyframes bonusBuyWidgetScroll': {
            from: { transform: 'translateY(0)' },
            to: { transform: 'translateY(-50%)' },
          },
          animation: `bonusBuyWidgetScroll ${autoScrollDuration}s linear infinite`,
          willChange: 'transform',
        }
      : {}),
  }),
)
