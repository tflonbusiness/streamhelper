import { Box, Typography } from '@mui/material'
import {
  BonusBuyWidgetBasketIcon,
  BonusBuyWidgetGiftIcon,
  BonusBuyWidgetLivePulseIcon,
  BonusBuyWidgetTitleIcon,
} from '@/components/bonus-buy/widget/bonus-buy-widget-icons'
import { colors } from '@/theme/colors'
import type { TypographyProps } from '@mui/material/Typography'
import { alpha, styled } from '@mui/material/styles'
import type { BonusBuyWidgetTheme } from '@/lib/bonus-buy-widget-presentation'

export const BORDER_SUBTLE = 'rgba(255,255,255,0.12)'
const WIDGET_SECTION_DIVIDER = '#1F1F24'
const SLOT_LIST_EDGE_FADE_PX = 10

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
  minWidth: 0,
  flex: 1,
  overflow: 'hidden',
})

export const StyledHeaderIconWrap = styled(Box)({
  width: 32,
  height: 28,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

export const StyledHeaderTitleIcon = styled(BonusBuyWidgetTitleIcon)({
  fontSize: 32,
  width: 32,
  height: 28,
})

export const StyledHeaderTitle = styled(Typography)({
  fontWeight: 600,
  fontSize: '28px',
  lineHeight: '40px',
  color: '#FFFFFF',
  letterSpacing: '1px',
  textTransform: 'capitalize',
  minWidth: 0,
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const StyledSlotCountPill = styled(Box, widgetThemeProps)<WidgetThemeProp>(
  ({ widgetTheme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
    backgroundColor: widgetTheme.surfaceColor,
    border: `1px solid ${widgetTheme.borderColor}`,
    borderRadius: '8px',
    paddingLeft: '8px',
    paddingRight: '8px',
    paddingTop: '4px',
    paddingBottom: '4px',
  }),
)

export const StyledSlotCountIcon = styled(BonusBuyWidgetGiftIcon, textColorProps)<
  TextColorProp
>(({ textColor }) => ({
  fontSize: 22,
  color: textColor,
}))

export const StyledSlotCountValue = styled(Typography)<TypographyProps>({
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

export const StyledAccentIcon = styled(BonusBuyWidgetBasketIcon, textColorProps)<
  TextColorProp
>(({ textColor }) => ({
  fontSize: 36,
  color: textColor,
}))

export const StyledStatValuesGroup = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginLeft: '10px',
  minWidth: 0,
  flex: 1,
  gap: '8px',
  overflow: 'hidden',
})

export const StyledStatValue = styled(Typography)({
  fontWeight: 600,
  fontSize: '26px',
  color: '#FFFFFF',
  whiteSpace: 'nowrap',
  flexShrink: 0,
})

export const StyledStatValueProfit = styled(StyledStatValue, textColorProps)<
  TextColorProp
>(({ textColor }) => ({
  color: textColor,
  flexShrink: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}))

export const StyledStatDivider = styled('span')({
  fontWeight: 500,
  fontSize: '30px',
  lineHeight: 1,
  color: 'rgba(255, 255, 255, 0.28)',
  flexShrink: 0,
  userSelect: 'none',
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

const titleOnlyCenterProps = {
  shouldForwardProp: (prop: string) => prop !== 'titleOnlyCentered',
}

type TitleOnlyCenteredProp = {
  titleOnlyCentered?: boolean
}

/** Matches two-line title + provider block so single-line titles stay vertically centered. */
const WIDGET_TITLE_BLOCK_MIN_HEIGHT = 44

export const StyledBestWinInfo = styled(Box, titleOnlyCenterProps)<TitleOnlyCenteredProp>(
  ({ titleOnlyCentered }) => ({
    flex: 1,
    marginLeft: '10px',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    ...(titleOnlyCentered && {
      justifyContent: 'center',
      minHeight: WIDGET_TITLE_BLOCK_MIN_HEIGHT,
    }),
  }),
)

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

export const StyledLiveInfo = styled(Box, titleOnlyCenterProps)<TitleOnlyCenteredProp>(
  ({ titleOnlyCentered }) => ({
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    ...(titleOnlyCentered && {
      justifyContent: 'center',
      minHeight: WIDGET_TITLE_BLOCK_MIN_HEIGHT,
    }),
  }),
)

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
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  backgroundColor: alpha(liveColor, 0.08),
  border: `1px solid ${alpha(liveColor, 0.4)}`,
  borderRadius: '10px',
  paddingLeft: '10px',
  paddingRight: '10px',
  paddingTop: '8px',
  paddingBottom: '8px',
  flexShrink: 0,
  marginLeft: 18,
}))

export const StyledLivePulseIcon = styled(BonusBuyWidgetLivePulseIcon)({
  fontSize: 16,
  width: 16,
  height: 16,
  flexShrink: 0,
  color: colors.error[500],
  display: 'block',
  lineHeight: 0,
})

export const StyledLiveLabel = styled(Typography)({
  fontWeight: 800,
  fontSize: '14px',
  lineHeight: '16px',
  letterSpacing: '1.2px',
  color: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  margin: 0,
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

export const StyledSlotInfo = styled(Box, titleOnlyCenterProps)<TitleOnlyCenteredProp>(
  ({ titleOnlyCentered }) => ({
    minWidth: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    ...(titleOnlyCentered && {
      justifyContent: 'center',
      minHeight: WIDGET_TITLE_BLOCK_MIN_HEIGHT,
    }),
  }),
)

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
  paddingTop: '4px',
  paddingBottom: '4px',
  flexShrink: 0,
}))

export const StyledMultiplierValue = styled(Typography, textColorProps)<
  TextColorProp
>(({ textColor }) => ({
  fontWeight: 600,
  fontSize: '16px',
  color: textColor,
  lineHeight: 1.2,
}))

export const StyledSlotListSection = styled(Box, widgetThemeProps)<WidgetThemeProp>(
  ({ widgetTheme }) => ({
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    minWidth: 0,
    paddingTop: 6,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 2,
      background: `linear-gradient(
        90deg,
        transparent 0%,
        ${alpha(WIDGET_SECTION_DIVIDER, 0.15)} 12%,
        ${WIDGET_SECTION_DIVIDER} 50%,
        ${alpha(WIDGET_SECTION_DIVIDER, 0.15)} 88%,
        transparent 100%
      )`,
      pointerEvents: 'none',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: SLOT_LIST_EDGE_FADE_PX + 4,
      background: `linear-gradient(
        180deg,
        ${alpha(widgetTheme.backgroundColor, 0.92)} 0%,
        ${alpha(widgetTheme.backgroundColor, 0.35)} 55%,
        transparent 100%
      )`,
      pointerEvents: 'none',
      zIndex: 1,
    },
  }),
)

export const StyledSlotListContainer = styled(Box, widgetThemeProps)<WidgetThemeProp>(
  ({ widgetTheme }) => ({
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 0,
    paddingTop: 4,
    paddingBottom: 4,
    maskImage: `linear-gradient(
      to bottom,
      transparent 0px,
      black ${SLOT_LIST_EDGE_FADE_PX}px,
      black calc(100% - ${SLOT_LIST_EDGE_FADE_PX}px),
      transparent 100%
    )`,
    WebkitMaskImage: `linear-gradient(
      to bottom,
      transparent 0px,
      black ${SLOT_LIST_EDGE_FADE_PX}px,
      black calc(100% - ${SLOT_LIST_EDGE_FADE_PX}px),
      transparent 100%
    )`,
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: SLOT_LIST_EDGE_FADE_PX,
      background: `linear-gradient(
        180deg,
        transparent 0%,
        ${alpha(widgetTheme.backgroundColor, 0.55)} 70%,
        ${widgetTheme.backgroundColor} 100%
      )`,
      pointerEvents: 'none',
      zIndex: 1,
    },
  }),
)

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
