import { Box, Typography } from '@mui/material'
import { useEffect, useMemo, useRef, useState, type TransitionEvent } from 'react'
import type { PrizeSpinWidgetLatestWin, PrizeSpinSector } from '@/api/prize-spin'
import { widgetUiCopy } from '@/i18n/widget-ui'
import {
  buildWheelSectors,
  rotationTickIndex,
  spinRotationFromCurrent,
} from '@/lib/prize-spin-wheel-geometry'
import {
  degreesToRadians,
  radiansToDegrees,
  streamHelperSpinEase,
} from '@/lib/prize-spin-wheel-canvas'
import { prizeSpinWheelAudio } from '@/lib/prize-spin-wheel-audio'
import {
  WHEEL_OVERLAY_FADE_MS,
  WHEEL_OVERLAY_TOTAL_MS,
  WHEEL_SPIN_DURATION_MS,
  WHEEL_SPIN_START_DELAY_MS,
} from '@/lib/prize-spin-wheel-overlay-timing'
import { buildPrizeSpinWidgetTheme, scaledPx } from '@/lib/prize-spin-widget-theme'
import { formatPrizeSpinWinnerSectorLabel } from '@/lib/prize-spin-winner-display'
import { PrizeSpinWheelCanvas } from '@/components/prize-spin/widget/PrizeSpinWheelCanvas'

const EXTRA_FULL_ROTATIONS = 8

type PrizeSpinWidgetCardProps = {
  recordId: number
  sectors: PrizeSpinSector[]
  latestWin: PrizeSpinWidgetLatestWin | null
  width: number
  height: number
  equalSectorSlices: boolean
  showSectorWeightInWinner: boolean
}

export function PrizeSpinWidgetCard({
  sectors,
  latestWin,
  width,
  height,
  equalSectorSlices,
  showSectorWeightInWinner,
}: PrizeSpinWidgetCardProps) {
  const theme = useMemo(() => buildPrizeSpinWidgetTheme(width, height), [width, height])
  const scale = theme.scale
  const geometries = useMemo(
    () => buildWheelSectors(sectors, { equalSectorSlices }),
    [sectors, equalSectorSlices],
  )
  const geometryById = useMemo(
    () => new Map(geometries.map((sector) => [sector.id, sector])),
    [geometries],
  )

  const winnerReserve = scaledPx(112, scale)
  const pillAndPointerReserve = scaledPx(56, scale)
  const wheelSize = Math.max(
    120,
    Math.min(width, height - winnerReserve - pillAndPointerReserve),
  )

  const [angleRadians, setAngleRadians] = useState(0)
  const angleRadiansRef = useRef(0)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [showWinner, setShowWinner] = useState(false)
  const [playerNick, setPlayerNick] = useState<string | null>(null)

  const lastAnimatedWinIdRef = useRef<number | null>(null)
  const lastSectorIndexRef = useRef(-1)
  const initializedRef = useRef(false)
  const animFrameRef = useRef<number | null>(null)
  const spinStartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideOverlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideCleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideCleanupDoneRef = useRef(false)

  useEffect(() => {
    angleRadiansRef.current = angleRadians
  }, [angleRadians])

  useEffect(() => {
    if (initializedRef.current) {
      return
    }

    if (latestWin) {
      lastAnimatedWinIdRef.current = latestWin.id
    }

    initializedRef.current = true
  }, [latestWin, geometryById])

  useEffect(() => {
    if (overlayVisible) {
      setShouldRender(true)
    }
  }, [overlayVisible])

  const finishOverlayHide = () => {
    if (hideCleanupDoneRef.current) {
      return
    }
    hideCleanupDoneRef.current = true
    setShouldRender(false)
    setShowWinner(false)
    setPlayerNick(null)
  }

  const scheduleOverlayHideCleanup = () => {
    if (hideCleanupTimerRef.current !== null) {
      window.clearTimeout(hideCleanupTimerRef.current)
    }
    hideCleanupTimerRef.current = window.setTimeout(() => {
      finishOverlayHide()
      hideCleanupTimerRef.current = null
    }, WHEEL_OVERLAY_FADE_MS)
  }

  const handleOverlayTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'opacity' || overlayVisible) {
      return
    }
    if (event.target !== event.currentTarget) {
      return
    }
    finishOverlayHide()
  }

  useEffect(() => {
    if (overlayVisible) {
      hideCleanupDoneRef.current = false
      return
    }
    if (!shouldRender) {
      return
    }
    scheduleOverlayHideCleanup()
    return () => {
      if (hideCleanupTimerRef.current !== null) {
        window.clearTimeout(hideCleanupTimerRef.current)
        hideCleanupTimerRef.current = null
      }
    }
  }, [overlayVisible, shouldRender])

  const clearSpinTimers = () => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (spinStartTimerRef.current !== null) {
      window.clearTimeout(spinStartTimerRef.current)
      spinStartTimerRef.current = null
    }
    if (hideOverlayTimerRef.current !== null) {
      window.clearTimeout(hideOverlayTimerRef.current)
      hideOverlayTimerRef.current = null
    }
    if (hideCleanupTimerRef.current !== null) {
      window.clearTimeout(hideCleanupTimerRef.current)
      hideCleanupTimerRef.current = null
    }
  }

  useEffect(() => {
    return () => clearSpinTimers()
  }, [])

  useEffect(() => {
    if (!latestWin || !initializedRef.current) {
      return
    }

    if (lastAnimatedWinIdRef.current === latestWin.id) {
      return
    }

    const sector = geometryById.get(latestWin.sectorId)
    if (!sector) {
      lastAnimatedWinIdRef.current = latestWin.id
      return
    }

    clearSpinTimers()

    setPlayerNick(latestWin.participantNick)
    setShowWinner(false)
    setOverlayVisible(true)
    setAngleRadians(0)
    angleRadiansRef.current = 0
    lastSectorIndexRef.current = -1

    hideOverlayTimerRef.current = window.setTimeout(() => {
      setOverlayVisible(false)
    }, WHEEL_OVERLAY_TOTAL_MS)

    spinStartTimerRef.current = window.setTimeout(() => {
      void prizeSpinWheelAudio.unlock()

      const startRadians = 0
      const targetDegrees = spinRotationFromCurrent(
        radiansToDegrees(startRadians),
        sector.midAngle,
        EXTRA_FULL_ROTATIONS,
      )
      const targetRadians = degreesToRadians(targetDegrees)
      const startTime = performance.now()

      const animate = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / WHEEL_SPIN_DURATION_MS, 1)
        const eased = streamHelperSpinEase(progress)
        const current = startRadians + (targetRadians - startRadians) * eased
        setAngleRadians(current)

        const sectorIndex = rotationTickIndex(current, geometries)
        if (sectorIndex !== lastSectorIndexRef.current) {
          prizeSpinWheelAudio.playTick()
          lastSectorIndexRef.current = sectorIndex
        }

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(animate)
        } else {
          setShowWinner(true)
          prizeSpinWheelAudio.playWin()
          lastAnimatedWinIdRef.current = latestWin.id
          animFrameRef.current = null
        }
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }, WHEEL_SPIN_START_DELAY_MS)

    return () => clearSpinTimers()
  }, [latestWin, geometryById, geometries])

  const winnerSectorLabel = useMemo(() => {
    if (!latestWin) {
      return ''
    }

    return formatPrizeSpinWinnerSectorLabel(
      latestWin.sectorLabel,
      latestWin.sectorId,
      sectors,
      showSectorWeightInWinner,
    )
  }, [latestWin, sectors, showSectorWeightInWinner])

  const showPlayerPill = Boolean(shouldRender && playerNick)

  if (sectors.length < 2) {
    return (
      <Box
        sx={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'transparent',
          fontFamily: theme.fontFamily,
        }}
      >
        <Typography sx={{ color: theme.textMuted, fontSize: scaledPx(14, scale) }}>
          {widgetUiCopy.prizeSpinAddSectors}
        </Typography>
      </Box>
    )
  }

  if (!shouldRender) {
    return (
      <Box
        sx={{
          width,
          height,
          bgcolor: 'transparent',
        }}
      />
    )
  }

  return (
    <Box
      sx={{
        width,
        height,
        bgcolor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
        fontFamily: theme.fontFamily,
        position: 'relative',
        opacity: overlayVisible ? 1 : 0,
        transform: overlayVisible
          ? 'translate3d(0, 0, 0) scale(1)'
          : 'translate3d(0, 0, 0) scale(0.96)',
        transition: `opacity ${WHEEL_OVERLAY_FADE_MS}ms ease-in-out, transform ${WHEEL_OVERLAY_FADE_MS}ms ease-in-out`,
        willChange: overlayVisible ? 'auto' : 'opacity, transform',
        backfaceVisibility: 'hidden',
        pointerEvents: overlayVisible ? 'auto' : 'none',
      }}
      onTransitionEnd={handleOverlayTransitionEnd}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 30,
            mb: `${scaledPx(-5, scale)}px`,
          }}
        >
          {showPlayerPill ? (
            <Box
              sx={{
                fontSize: scaledPx(14, scale),
                fontWeight: 700,
                letterSpacing: '0.02em',
                color: '#FFFFFF',
                bgcolor: 'rgba(17,19,24,0.95)',
                border: '1px solid rgba(255,255,255,0.10)',
                backdropFilter: 'blur(24px)',
                px: `${scaledPx(24, scale)}px`,
                py: `${scaledPx(10, scale)}px`,
                borderRadius: '999px',
                mb: `${scaledPx(4, scale)}px`,
              }}
            >
              <Box component="span" sx={{ color: 'rgba(255,255,255,0.45)' }}>
                {widgetUiCopy.prizeSpinSpinning}
              </Box>
              <Box component="span" sx={{ mx: `${scaledPx(8, scale)}px`, color: 'rgba(255,255,255,0.20)' }}>
                •
              </Box>
              <Box component="span">{playerNick}</Box>
            </Box>
          ) : null}

          <Box
            sx={{
              width: 0,
              height: 0,
              borderLeft: `${scaledPx(10, scale)}px solid transparent`,
              borderRight: `${scaledPx(10, scale)}px solid transparent`,
              borderTop: `${scaledPx(20, scale)}px solid #FFFFFF`,
              mt: `${scaledPx(-1, scale)}px`,
              zIndex: 40,
            }}
          />
        </Box>

        <PrizeSpinWheelCanvas sectors={geometries} angleRadians={angleRadians} size={wheelSize} />
      </Box>

      <Box
        sx={{
          height: winnerReserve,
          mt: `${scaledPx(8, scale)}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {showWinner && latestWin ? (
          <Box
            sx={{
              textAlign: 'center',
              bgcolor: 'rgba(17,19,24,0.95)',
              border: '1px solid rgba(255,255,255,0.10)',
              backdropFilter: 'blur(24px)',
              color: '#FFFFFF',
              px: `${scaledPx(36, scale)}px`,
              py: `${scaledPx(12, scale)}px`,
              borderRadius: `${scaledPx(16, scale)}px`,
              opacity: showWinner ? 1 : 0,
              transform: showWinner ? 'translate3d(0, 0, 0)' : 'translate3d(0, 8px, 0)',
              transition: 'opacity 400ms ease, transform 400ms ease',
            }}
          >
            <Typography
              sx={{
                fontSize: scaledPx(10, scale),
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.40)',
                mb: 0.5,
              }}
            >
              {widgetUiCopy.prizeSpinPrize}
            </Typography>
            <Typography
              sx={{
                fontSize: scaledPx(30, scale),
                fontWeight: 900,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {winnerSectorLabel}
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}
