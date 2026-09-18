import { Box, Typography } from '@mui/material'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { PrizeSpinWidgetLatestWin, PrizeSpinSector } from '@/api/prize-spin'
import {
  restRotationForSector,
  spinRotationFromCurrent,
  buildWheelSectors,
} from '@/lib/prize-spin-wheel-geometry'
import {
  buildPrizeSpinWidgetTheme,
  scaledPx,
} from '@/lib/prize-spin-widget-theme'
import { PrizeSpinWheel } from '@/components/prize-spin/PrizeSpinWheel'
import { PrizeSpinWinnerBanner } from '@/components/prize-spin/PrizeSpinWinnerBanner'

const SPIN_DURATION_MS = 3800
const POINTER_BOUNCE_MS = 300

type PrizeSpinWidgetCardProps = {
  recordId: number
  sectors: PrizeSpinSector[]
  latestWin: PrizeSpinWidgetLatestWin | null
  width: number
  height: number
}

export function PrizeSpinWidgetCard({
  recordId,
  sectors,
  latestWin,
  width,
  height,
}: PrizeSpinWidgetCardProps) {
  const theme = useMemo(() => buildPrizeSpinWidgetTheme(width, height), [width, height])
  const scale = theme.scale
  const padding = scaledPx(16, scale)
  const headerHeight = scaledPx(44, scale)
  const gap = scaledPx(8, scale)
  const bannerReserve = scaledPx(80, scale)
  const hasBannerSpace = latestWin !== null

  const wheelDiameter = useMemo(() => {
    const innerHeight = height - padding * 2
    const reserved = headerHeight + gap + (hasBannerSpace ? bannerReserve + gap : 0)
    const available = innerHeight - reserved
    const maxByWidth = width - padding * 2
    return Math.max(0, Math.min(available, maxByWidth))
  }, [height, width, padding, headerHeight, gap, bannerReserve, hasBannerSpace])

  const geometries = useMemo(() => buildWheelSectors(sectors), [sectors])
  const geometryById = useMemo(
    () => new Map(geometries.map((sector) => [sector.id, sector])),
    [geometries],
  )

  const [rotation, setRotation] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showBanner, setShowBanner] = useState(latestWin !== null)
  const [pointerBounce, setPointerBounce] = useState(false)
  const lastAnimatedWinIdRef = useRef<number | null>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) {
      return
    }

    if (latestWin) {
      const sector = geometryById.get(latestWin.sectorId)
      if (sector) {
        setRotation(restRotationForSector(sector.midAngle))
      }
      setShowBanner(true)
      lastAnimatedWinIdRef.current = latestWin.id
    }

    initializedRef.current = true
  }, [latestWin, geometryById])

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
      setShowBanner(true)
      return
    }

    setShowBanner(false)
    setIsAnimating(true)
    setRotation((current) => spinRotationFromCurrent(current, sector.midAngle))

    const spinTimer = window.setTimeout(() => {
      setIsAnimating(false)
      setPointerBounce(true)
      window.setTimeout(() => setPointerBounce(false), POINTER_BOUNCE_MS)
      setShowBanner(true)
      lastAnimatedWinIdRef.current = latestWin.id
    }, SPIN_DURATION_MS)

    return () => window.clearTimeout(spinTimer)
  }, [latestWin, geometryById])

  return (
    <Box
      sx={{
        width,
        height,
        bgcolor: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: `${scaledPx(theme.cardRadius, scale)}px`,
        boxShadow: theme.cardShadow,
        p: `${padding}px`,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: theme.fontFamily,
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          height: headerHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${scaledPx(10, scale)}px`, minWidth: 0 }}>
          <AutorenewIcon
            sx={{
              fontSize: scaledPx(28, scale),
              color: theme.moduleAccent,
              flexShrink: 0,
              filter: `drop-shadow(0 0 ${scaledPx(8, scale)}px ${theme.moduleAccentGlow})`,
            }}
            aria-hidden
          />
          <Typography
            sx={{
              color: theme.textPrimary,
              fontSize: scaledPx(16, scale),
              fontWeight: 600,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
            }}
          >
            Prize Spin #{recordId}
          </Typography>
        </Box>
        {isAnimating ? (
          <Box
            sx={{
              bgcolor: theme.surface,
              border: `1px solid ${theme.divider}`,
              borderRadius: `${scaledPx(8, scale)}px`,
              px: `${scaledPx(8, scale)}px`,
              py: `${scaledPx(4, scale)}px`,
              color: theme.moduleAccent,
              fontSize: scaledPx(10, scale),
              fontWeight: 700,
              letterSpacing: '0.06em',
              flexShrink: 0,
            }}
          >
            SPINNING
          </Box>
        ) : null}
      </Box>

      <Box
        sx={{
          mt: `${gap}px`,
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flex: hasBannerSpace ? '0 0 auto' : 1,
          minHeight: wheelDiameter > 0 ? wheelDiameter : 0,
        }}
      >
        <PrizeSpinWheel
          sectors={sectors}
          rotation={rotation}
          isAnimating={isAnimating}
          pointerBounce={pointerBounce}
          wheelDiameter={wheelDiameter}
          theme={theme}
        />
      </Box>

      <Box
        sx={{
          mt: `${gap}px`,
          minHeight: hasBannerSpace ? bannerReserve : 0,
          flexShrink: 0,
        }}
      >
        {latestWin ? (
          <PrizeSpinWinnerBanner
            participantNick={latestWin.participantNick}
            sectorLabel={latestWin.sectorLabel}
            theme={theme}
            visible={showBanner}
          />
        ) : null}
      </Box>
    </Box>
  )
}
