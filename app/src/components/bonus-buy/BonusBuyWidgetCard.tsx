import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral'
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt'
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied'
import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import type { BonusBuySlot } from '@/api/bonus-buy'
import { formatMultiplierDisplay } from '@/lib/bonus-buy-stats'
import type {
  AverageXSentiment,
  BonusBuyWidgetCardProps,
  BonusBuyWidgetTheme,
} from '@/lib/bonus-buy-widget-presentation'

const BORDER_SUBTLE = 'rgba(255,255,255,0.12)'

const AVERAGE_X_ICONS: Record<
  AverageXSentiment,
  typeof SentimentNeutralIcon
> = {
  dissatisfied: SentimentVeryDissatisfiedIcon,
  neutral: SentimentNeutralIcon,
  satisfied: SentimentSatisfiedAltIcon,
}

function formatUsd(amount: string | number): string {
  const value = typeof amount === 'string' ? Number.parseFloat(amount) : amount
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function isWinPositive(slot: BonusBuySlot): boolean {
  if (slot.winAmount === null) {
    return false
  }
  return Number.parseFloat(slot.winAmount) >= Number.parseFloat(slot.purchaseAmount)
}

function cellSx(theme: BonusBuyWidgetTheme, height: number) {
  return {
    bgcolor: theme.surfaceColor,
    border: `1px solid ${BORDER_SUBTLE}`,
    borderRadius: '12px',
    height,
    display: 'flex',
    alignItems: 'center',
    px: '14px',
    py: '6px',
  }
}

function WidgetSlotRow({
  slot,
  index,
  theme,
}: {
  slot: BonusBuySlot
  index: number
  theme: BonusBuyWidgetTheme
}) {
  const positive = isWinPositive(slot)
  const resultColor =
    slot.winAmount === null
      ? theme.textMutedColor
      : positive
        ? theme.positiveColor
        : theme.negativeColor

  return (
    <Box
      sx={{
        ...cellSx(theme, 62),
        justifyContent: 'space-between',
        gap: 1,
        flexShrink: 0,
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 500,
            color: '#FFFFFF',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {index + 1}. {slot.slotName}
        </Typography>
        <Typography
          sx={{
            fontSize: '16px',
            color: theme.textMutedColor,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {slot.nickProvider ?? '—'}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: '18px', color: theme.textMutedColor, flexShrink: 0 }}>
        {formatUsd(slot.purchaseAmount)}
      </Typography>
      <Typography
        sx={{
          fontSize: '18px',
          color: resultColor,
          flexShrink: 0,
          minWidth: 56,
          textAlign: 'right',
        }}
      >
        {slot.winAmount !== null ? formatUsd(slot.winAmount) : '—'}
      </Typography>
      {slot.multiplier ? (
        <Box
          sx={{
            bgcolor: alpha(positive ? theme.positiveColor : theme.negativeColor, 0.08),
            border: `1px solid ${alpha(positive ? theme.positiveColor : theme.negativeColor, 0.3)}`,
            borderRadius: '8px',
            px: '8px',
            py: '4px',
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '16px',
              color: positive ? theme.positiveColor : theme.negativeColor,
              lineHeight: '28px',
            }}
          >
            {formatMultiplierDisplay(slot.multiplier)}
          </Typography>
        </Box>
      ) : null}
    </Box>
  )
}

export function BonusBuyWidgetCard({
  record,
  theme,
  slots,
  stats,
  playingSlot,
  playingIndex,
  listSlots,
  slotsToRender,
  autoScrollEnabled,
  autoScrollDuration,
  averageXColor,
  averageXSentiment,
}: BonusBuyWidgetCardProps) {
  const AverageXIcon = AVERAGE_X_ICONS[averageXSentiment]

  return (
    <Box
      sx={{
        width: theme.width,
        height: theme.height,
        bgcolor: theme.backgroundColor,
        border: `1px solid ${theme.borderColor}`,
        borderRadius: `${theme.borderRadius}px`,
        p: `${theme.padding}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        overflow: 'hidden',
        fontFamily: theme.fontFamily,
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          pb: 1,
          borderBottom: '2px solid #1F1F24',
          minHeight: 55,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.accentColor,
            }}
          >
            <CardGiftcardIcon sx={{ fontSize: 28 }} aria-hidden />
          </Box>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '28px',
              lineHeight: '40px',
              color: '#FFFFFF',
              letterSpacing: '1px',
              textTransform: 'capitalize',
            }}
          >
            Bonus Buy #{record.id}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            bgcolor: theme.surfaceColor,
            border: `1px solid ${theme.borderColor}`,
            borderRadius: '12px',
            px: '12px',
            py: '6px',
          }}
        >
          <CardGiftcardIcon sx={{ fontSize: 30, color: theme.accentColor }} aria-hidden />
          <Typography sx={{ fontWeight: 600, fontSize: '26px', color: '#FFFFFF' }}>
            {slots.length}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: '12px' }}>
        <Box sx={{ ...cellSx(theme, 54), flex: 1 }}>
          <ShoppingBasketIcon sx={{ fontSize: 36, color: theme.accentColor }} aria-hidden />
          <Typography
            sx={{ ml: '10px', fontWeight: 600, fontSize: '26px', color: '#FFFFFF' }}
          >
            {formatUsd(stats.totalWin)}
          </Typography>
        </Box>
        <Box sx={{ ...cellSx(theme, 54) }}>
          <AverageXIcon sx={{ fontSize: 36, color: averageXColor }} aria-hidden />
          <Typography
            sx={{
              ml: '10px',
              fontWeight: 600,
              fontSize: '28px',
              color: averageXColor,
            }}
          >
            {stats.averageX}
          </Typography>
        </Box>
      </Box>

      {playingSlot && playingSlot.winAmount !== null ? (
        <Box sx={{ ...cellSx(theme, 68) }}>
          <WorkspacePremiumIcon sx={{ fontSize: 36, color: theme.accentColor }} aria-hidden />
          <Box sx={{ flex: 1, ml: '10px', minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '22px',
                color: '#FFFFFF',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {playingSlot.slotName}
            </Typography>
            <Typography sx={{ fontSize: '18px', color: theme.textMutedColor, lineHeight: 1.2 }}>
              {playingSlot.nickProvider ?? '—'}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '26px',
              color: '#FFFFFF',
              flexShrink: 0,
              ml: 1,
            }}
          >
            {formatUsd(playingSlot.winAmount)}
          </Typography>
        </Box>
      ) : null}

      {playingSlot ? (
        <Box
          sx={{
            position: 'relative',
            ...cellSx(theme, 68),
            overflow: 'hidden',
            boxShadow: '0px 12px 32px -4px rgba(0,0,0,0.85)',
            borderColor: 'rgba(255,255,255,0.15)',
            pl: '22px',
            pr: '13px',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: -2,
              bottom: -1,
              width: 8,
              bgcolor: theme.accentColor,
              boxShadow: `0 0 12px ${theme.accentColor}`,
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: '22px',
                  color: theme.accentColor,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {playingIndex + 1}. {playingSlot.slotName}
              </Typography>
              <Typography sx={{ fontSize: '18px', color: theme.textMutedColor }}>
                {playingSlot.nickProvider ?? '—'}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '18px', color: theme.textMutedColor, flexShrink: 0 }}>
              {formatUsd(playingSlot.purchaseAmount)}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              bgcolor: alpha(theme.liveColor, 0.08),
              border: `1px solid ${alpha(theme.liveColor, 0.4)}`,
              borderRadius: '10px',
              px: '10px',
              py: '4px',
              flexShrink: 0,
              ml: 1,
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: theme.liveColor,
              }}
            />
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '14px',
                letterSpacing: '1.2px',
                color: '#FFFFFF',
              }}
            >
              LIVE
            </Typography>
          </Box>
        </Box>
      ) : null}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          py: 1,
          maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
        }}
      >
        <Box
          sx={{
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
          }}
        >
          {slotsToRender.map((slot, index) => (
            <WidgetSlotRow
              key={`${autoScrollEnabled ? Math.floor(index / listSlots.length) : 0}-${slot.id}`}
              slot={slot}
              index={index % listSlots.length}
              theme={theme}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}
