import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Crown, Gift, ShoppingBasket, Smile } from 'lucide-react'
import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import type { BonusBuySlot } from '@/api/bonus-buy'
import {
  computeSessionStats,
  formatMultiplierDisplay,
} from '@/lib/bonus-buy-stats'
import { parseBonusBuyWidgetDimensions } from '@/lib/bonus-buy-widget-dimensions'
import { BONUS_BUY_WIDGET_MOCKS } from '@/lib/bonus-buy-widget-mock'
const widgetBg = '#0A0A0C'
const surfaceBg = '#121215'
const borderStrong = '#2F2F31'
const borderSubtle = 'rgba(255,255,255,0.12)'
const textMuted = '#9CA3AF'
const amber = '#F59E0B'
const emerald = '#10B981'
const red = '#EF4444'
const liveRed = '#F22'
const AUTO_SCROLL_SECONDS_PER_ITEM = 3.5

function formatUsd(amount: string | number): string {
  const value = typeof amount === 'string' ? Number.parseFloat(amount) : amount
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function parseAverageX(value: string): number {
  return Number.parseFloat(value.replace(/x$/i, '')) || 0
}

function isWinPositive(slot: BonusBuySlot): boolean {
  if (slot.winAmount === null) {
    return false
  }
  return Number.parseFloat(slot.winAmount) >= Number.parseFloat(slot.purchaseAmount)
}

function cellSx(height: number) {
  return {
    bgcolor: surfaceBg,
    border: `1px solid ${borderSubtle}`,
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
}: {
  slot: BonusBuySlot
  index: number
}) {
  const positive = isWinPositive(slot)
  const resultColor = slot.winAmount === null ? textMuted : positive ? emerald : red

  return (
    <Box
      sx={{
        ...cellSx(62),
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
            color: textMuted,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {slot.nickProvider ?? '—'}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: '18px', color: textMuted, flexShrink: 0 }}>
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
            bgcolor: alpha(positive ? emerald : red, 0.08),
            border: `1px solid ${alpha(positive ? emerald : red, 0.3)}`,
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
              color: positive ? emerald : red,
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

function WidgetNotFound() {
  return (
    <Box
      sx={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <Typography sx={{ color: textMuted, fontSize: '1rem' }}>
        Session not found.
      </Typography>
    </Box>
  )
}

export function BonusBuyStreamWidgetPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const dimensions = useMemo(
    () => parseBonusBuyWidgetDimensions(searchParams),
    [searchParams],
  )
  const mock = id ? BONUS_BUY_WIDGET_MOCKS[id] : undefined

  const { record, slots, stats, playingSlot, listSlots, playingIndex } = useMemo(() => {
    if (!mock) {
      return {
        record: null,
        slots: [] as BonusBuySlot[],
        stats: null,
        playingSlot: null as BonusBuySlot | null,
        listSlots: [] as BonusBuySlot[],
        playingIndex: -1,
      }
    }

    const activeSlots = [...mock.slots].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    const playing = activeSlots.find((slot) => slot.isNowPlaying) ?? null
    const playingIdx = playing
      ? activeSlots.findIndex((slot) => slot.id === playing.id)
      : -1
    const list = activeSlots.filter((slot) => !slot.isNowPlaying)

    return {
      record: mock.record,
      slots: activeSlots,
      stats: computeSessionStats(mock.record.startBalance, activeSlots),
      playingSlot: playing,
      listSlots: list,
      playingIndex: playingIdx,
    }
  }, [mock])

  if (!record || !stats) {
    return <WidgetNotFound />
  }

  const autoScrollEnabled = listSlots.length > 0
  const slotsToRender = autoScrollEnabled
    ? [...listSlots, ...listSlots]
    : listSlots
  const autoScrollDuration = Math.max(
    listSlots.length * AUTO_SCROLL_SECONDS_PER_ITEM,
    12,
  )

  const averageXValue = parseAverageX(stats.averageX)
  const averageXColor = averageXValue > 1 ? emerald : '#FFFFFF'

  return (
    <Box
      sx={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
        p: 2,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <Box
        sx={{
          width: dimensions.width,
          height: dimensions.height,
          maxWidth: '100%',
          bgcolor: widgetBg,
          border: `1px solid ${borderStrong}`,
          borderRadius: '20px',
          p: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            pb: 1,
            borderBottom: `2px solid #1F1F24`,
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
                color: amber,
              }}
            >
              <Gift size={28} aria-hidden />
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
              bgcolor: surfaceBg,
              border: `1px solid ${borderStrong}`,
              borderRadius: '12px',
              px: '12px',
              py: '6px',
            }}
          >
            <Gift size={30} color={amber} aria-hidden />
            <Typography sx={{ fontWeight: 600, fontSize: '26px', color: '#FFFFFF' }}>
              {slots.length}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: '12px' }}>
          <Box sx={{ ...cellSx(54), flex: 1 }}>
            <ShoppingBasket size={36} color={amber} aria-hidden />
            <Typography
              sx={{ ml: '10px', fontWeight: 600, fontSize: '26px', color: '#FFFFFF' }}
            >
              {formatUsd(record.startBalance)}
            </Typography>
          </Box>
          <Box sx={{ ...cellSx(54) }}>
            <Smile size={36} color={emerald} aria-hidden />
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
          <Box sx={{ ...cellSx(68) }}>
            <Crown size={36} color={amber} aria-hidden />
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
              <Typography sx={{ fontSize: '18px', color: textMuted, lineHeight: 1.2 }}>
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
              ...cellSx(68),
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
                bgcolor: amber,
                boxShadow: `0 0 12px ${amber}`,
              }}
            />
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: '22px',
                    color: amber,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {playingIndex + 1}. {playingSlot.slotName}
                </Typography>
                <Typography sx={{ fontSize: '18px', color: textMuted }}>
                  {playingSlot.nickProvider ?? '—'}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '18px', color: textMuted, flexShrink: 0 }}>
                {formatUsd(playingSlot.purchaseAmount)}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                bgcolor: alpha(liveRed, 0.08),
                border: `1px solid ${alpha(liveRed, 0.4)}`,
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
                  bgcolor: liveRed,
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
            maskImage:
              'linear-gradient(to bottom, black 85%, transparent 100%)',
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
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
