import { Box, Typography } from '@mui/material'
import {
  buildWheelSectors,
  describeArcSegment,
  polarToCartesian,
  shouldShowSectorLabel,
  truncateSectorLabel,
  type WheelSectorInput,
} from '@/lib/prize-spin-wheel-geometry'
import {
  describeFrameNotch,
  FORTUNE_WHEEL_COLORS,
  sectorGradientId,
  sectorLabelColor,
  shadeHex,
} from '@/lib/prize-spin-wheel-visual'
import {
  scaledPx,
  type PrizeSpinWidgetTheme,
} from '@/lib/prize-spin-widget-theme'

type PrizeSpinWheelProps = {
  sectors: WheelSectorInput[]
  rotation: number
  isAnimating: boolean
  pointerBounce: boolean
  wheelDiameter: number
  theme: PrizeSpinWidgetTheme
}

export function PrizeSpinWheel({
  sectors,
  rotation,
  isAnimating,
  pointerBounce,
  wheelDiameter,
  theme,
}: PrizeSpinWheelProps) {
  const scale = theme.scale
  const size = wheelDiameter
  const center = size / 2
  const outerR = size / 2
  const frameWidth = scaledPx(14, scale)
  const segmentOuterR = outerR - frameWidth
  const frameMidR = outerR - frameWidth / 2
  const hubRadius = outerR * 0.11
  const pointerHeight = scaledPx(22, scale)
  const pointerWidth = scaledPx(18, scale)
  const studRadius = scaledPx(5, scale)
  const geometries = buildWheelSectors(sectors)
  const gradientId = `fortune-wheel-${size}`
  const boundaryAngles = geometries.map((sector) => sector.startAngle)

  if (sectors.length < 2) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Box component="svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={center}
            cy={center}
            r={segmentOuterR}
            fill="#F5F5F5"
            stroke={FORTUNE_WHEEL_COLORS.frameRed}
            strokeWidth={frameWidth}
          />
        </Box>
        <Typography
          sx={{
            color: theme.textMuted,
            fontSize: scaledPx(13, scale),
            fontFamily: theme.fontFamily,
            textAlign: 'center',
            maxWidth: '60%',
            position: 'absolute',
          }}
        >
          Add sectors in dashboard
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        width: size,
        height: size,
        position: 'relative',
        filter: `drop-shadow(0 ${scaledPx(5, scale)}px ${scaledPx(14, scale)}px rgba(0,0,0,0.35))`,
      }}
    >
      <Box
        component="svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        sx={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={`${gradientId}-frame`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={FORTUNE_WHEEL_COLORS.frameRedLight} />
            <stop offset="45%" stopColor={FORTUNE_WHEEL_COLORS.frameRed} />
            <stop offset="100%" stopColor={FORTUNE_WHEEL_COLORS.frameRedDark} />
          </linearGradient>
          <radialGradient id={`${gradientId}-hub`} cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor={FORTUNE_WHEEL_COLORS.goldLight} />
            <stop offset="55%" stopColor={FORTUNE_WHEEL_COLORS.goldMid} />
            <stop offset="100%" stopColor={FORTUNE_WHEEL_COLORS.goldDark} />
          </radialGradient>
          <linearGradient id={`${gradientId}-pointer`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={FORTUNE_WHEEL_COLORS.goldDark} />
            <stop offset="50%" stopColor={FORTUNE_WHEEL_COLORS.goldMid} />
            <stop offset="100%" stopColor={FORTUNE_WHEEL_COLORS.goldLight} />
          </linearGradient>
          {geometries.map((sector) => {
            const base = sector.color
            return (
              <radialGradient
                key={sectorGradientId(sector.id)}
                id={sectorGradientId(sector.id)}
                cx="42%"
                cy="38%"
                r="75%"
              >
                <stop offset="0%" stopColor={shadeHex(base, 0.88)} />
                <stop offset="55%" stopColor={base} />
                <stop offset="100%" stopColor={shadeHex(base, 1.12)} />
              </radialGradient>
            )
          })}
        </defs>

        {/* Rotating pie segments */}
        <g
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: `${center}px ${center}px`,
            transition: isAnimating
              ? 'transform 3800ms cubic-bezier(0.12, 0.75, 0.1, 1)'
              : 'none',
          }}
        >
          {geometries.map((sector) => (
            <path
              key={sector.id}
              d={describeArcSegment(
                center,
                center,
                hubRadius + scaledPx(2, scale),
                segmentOuterR - scaledPx(1, scale),
                sector.startAngle,
                sector.endAngle,
              )}
              fill={`url(#${sectorGradientId(sector.id)})`}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={scaledPx(1.5, scale)}
            />
          ))}

          {geometries.map((sector) => {
            if (!shouldShowSectorLabel(sector.startAngle, sector.endAngle, 16)) {
              return null
            }

            const labelRadius = hubRadius + (segmentOuterR - hubRadius) * 0.58
            const angle = sector.midAngle
            const radians = (angle * Math.PI) / 180
            const x = center + labelRadius * Math.cos(radians)
            const y = center + labelRadius * Math.sin(radians)
            const flip = angle > 90 && angle < 270
            const textRotation = flip ? angle + 180 : angle
            const labelColor = sectorLabelColor(sector.color)
            const fontSize = scaledPx(12, scale)

            return (
              <text
                key={`label-${sector.id}`}
                x={x}
                y={y}
                fill={labelColor}
                fontSize={fontSize}
                fontWeight={800}
                fontFamily={theme.fontFamily}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${textRotation}, ${x}, ${y})`}
                style={{
                  paintOrder: 'stroke',
                  stroke: labelColor === '#FFFFFF' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.2)',
                  strokeWidth: scaledPx(2, scale),
                  pointerEvents: 'none',
                  letterSpacing: '0.03em',
                }}
              >
                {truncateSectorLabel(sector.label, 14)}
              </text>
            )
          })}
        </g>

        {/* Red outer frame */}
        <circle
          cx={center}
          cy={center}
          r={frameMidR}
          fill="none"
          stroke={`url(#${gradientId}-frame)`}
          strokeWidth={frameWidth}
        />

        {/* White notches at segment boundaries */}
        {boundaryAngles.map((angle, index) => (
          <path
            key={`notch-${index}`}
            d={describeFrameNotch(
              center,
              center,
              segmentOuterR - scaledPx(1, scale),
              angle,
              scaledPx(8, scale),
              4,
            )}
            fill={FORTUNE_WHEEL_COLORS.notch}
            opacity={0.95}
          />
        ))}

        {/* Gold studs at segment centers */}
        {geometries.map((sector) => {
          const stud = polarToCartesian(center, center, frameMidR, sector.midAngle)
          return (
            <g key={`stud-${sector.id}`}>
              <circle
                cx={stud.x}
                cy={stud.y}
                r={studRadius + scaledPx(1, scale)}
                fill="rgba(0,0,0,0.2)"
                transform={`translate(${scaledPx(1, scale)} ${scaledPx(1, scale)})`}
              />
              <circle
                cx={stud.x}
                cy={stud.y}
                r={studRadius}
                fill={FORTUNE_WHEEL_COLORS.stud}
                stroke={FORTUNE_WHEEL_COLORS.studStroke}
                strokeWidth={scaledPx(1, scale)}
              />
              <circle
                cx={stud.x - studRadius * 0.25}
                cy={stud.y - studRadius * 0.3}
                r={studRadius * 0.28}
                fill="rgba(255,255,255,0.55)"
              />
            </g>
          )
        })}

        {/* Gold hub */}
        <circle
          cx={center}
          cy={center}
          r={hubRadius + scaledPx(3, scale)}
          fill={FORTUNE_WHEEL_COLORS.hubShadow}
          opacity={0.35}
        />
        <circle
          cx={center}
          cy={center}
          r={hubRadius}
          fill={`url(#${gradientId}-hub)`}
          stroke={FORTUNE_WHEEL_COLORS.goldDark}
          strokeWidth={scaledPx(2, scale)}
        />
        <ellipse
          cx={center - hubRadius * 0.22}
          cy={center - hubRadius * 0.28}
          rx={hubRadius * 0.32}
          ry={hubRadius * 0.2}
          fill="rgba(255,255,255,0.5)"
        />

        {/* Fixed gold pointer at top */}
        <g
          transform={`translate(${center} ${center - hubRadius + scaledPx(2, scale)}) scale(${pointerBounce ? 1.14 : 1})`}
          style={{
            transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <path
            d={`M 0 ${-pointerHeight} L ${-pointerWidth / 2} ${scaledPx(4, scale)} L ${pointerWidth / 2} ${scaledPx(4, scale)} Z`}
            fill={`url(#${gradientId}-pointer)`}
            stroke={FORTUNE_WHEEL_COLORS.goldDark}
            strokeWidth={scaledPx(1.5, scale)}
            strokeLinejoin="round"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))',
            }}
          />
        </g>
      </Box>
    </Box>
  )
}
