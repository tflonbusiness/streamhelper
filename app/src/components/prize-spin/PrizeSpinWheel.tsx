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
  describeArcStroke,
  describeDonut,
  describeSegmentDivider,
  PREMIUM_WHEEL_COLORS,
  RIM_GLINT_ANGLES,
  RIM_INNER_HIGHLIGHTS,
  RIM_OUTER_HIGHLIGHTS,
  rimStudAngles,
  RIM_GEM_COUNT,
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
  const rimWidth = scaledPx(22, scale)
  const segmentOuterR = outerR - rimWidth
  const rimMidR = outerR - rimWidth / 2
  const hubRadius = outerR * 0.14
  const segmentInnerR = hubRadius + scaledPx(4, scale)
  const pointerHeight = scaledPx(28, scale)
  const pointerWidth = scaledPx(24, scale)
  const studRadius = scaledPx(3.5, scale)
  const geometries = buildWheelSectors(sectors)
  const gradientId = `premium-wheel-${size}`
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
          <defs>
            <linearGradient id={`${gradientId}-gold-rim`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={PREMIUM_WHEEL_COLORS.goldLight} />
              <stop offset="50%" stopColor={PREMIUM_WHEEL_COLORS.goldMid} />
              <stop offset="100%" stopColor={PREMIUM_WHEEL_COLORS.goldDark} />
            </linearGradient>
          </defs>
          <path
            d={describeDonut(center, center, outerR, segmentOuterR)}
            fill={`url(#${gradientId}-gold-rim)`}
            fillRule="evenodd"
          />
          <circle cx={center} cy={center} r={segmentOuterR} fill="#F5F5F5" />
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
      }}
    >
      <Box
        component="svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        sx={{ overflow: 'visible' }}
        aria-hidden
      >
        <defs>
          <filter id={`${gradientId}-shadow`} x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow
              dx="0"
              dy={scaledPx(6, scale)}
              stdDeviation={scaledPx(8, scale)}
              floodColor="#000000"
              floodOpacity="0.35"
            />
          </filter>

          <linearGradient id={`${gradientId}-gold-rim`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={PREMIUM_WHEEL_COLORS.goldLight} />
            <stop offset="22%" stopColor={PREMIUM_WHEEL_COLORS.goldMid} />
            <stop offset="55%" stopColor={PREMIUM_WHEEL_COLORS.goldDark} />
            <stop offset="100%" stopColor={PREMIUM_WHEEL_COLORS.goldDeep} />
          </linearGradient>

          <radialGradient id={`${gradientId}-gold-rim-fill`} cx="42%" cy="32%" r="72%">
            <stop offset="0%" stopColor="#FFFDE7" />
            <stop offset="35%" stopColor={PREMIUM_WHEEL_COLORS.goldLight} />
            <stop offset="65%" stopColor={PREMIUM_WHEEL_COLORS.goldMid} />
            <stop offset="100%" stopColor={PREMIUM_WHEEL_COLORS.goldDark} />
          </radialGradient>

          <linearGradient id={`${gradientId}-gold-rim-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={PREMIUM_WHEEL_COLORS.goldLight} />
            <stop offset="45%" stopColor={PREMIUM_WHEEL_COLORS.goldMid} stopOpacity="0.3" />
            <stop offset="100%" stopColor={PREMIUM_WHEEL_COLORS.goldDeep} stopOpacity="0.6" />
          </linearGradient>

          <radialGradient id={`${gradientId}-gold-stud`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFDE7" />
            <stop offset="55%" stopColor={PREMIUM_WHEEL_COLORS.goldMid} />
            <stop offset="100%" stopColor={PREMIUM_WHEEL_COLORS.goldDark} />
          </radialGradient>

          <linearGradient id={`${gradientId}-gold-bracket`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={PREMIUM_WHEEL_COLORS.goldLight} />
            <stop offset="100%" stopColor={PREMIUM_WHEEL_COLORS.goldDark} />
          </linearGradient>

          <radialGradient id={`${gradientId}-hub`} cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#FFFDE7" />
            <stop offset="18%" stopColor={PREMIUM_WHEEL_COLORS.goldLight} />
            <stop offset="42%" stopColor={PREMIUM_WHEEL_COLORS.goldMid} />
            <stop offset="72%" stopColor={PREMIUM_WHEEL_COLORS.goldDark} />
            <stop offset="100%" stopColor={PREMIUM_WHEEL_COLORS.goldDeep} />
          </radialGradient>

          <linearGradient id={`${gradientId}-pointer-red`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EF5350" />
            <stop offset="50%" stopColor={PREMIUM_WHEEL_COLORS.pointerRed} />
            <stop offset="100%" stopColor={PREMIUM_WHEEL_COLORS.pointerRedDark} />
          </linearGradient>

          {geometries.map((sector) => {
            const base = sector.color
            return (
              <radialGradient
                key={sectorGradientId(sector.id)}
                id={sectorGradientId(sector.id)}
                gradientUnits="userSpaceOnUse"
                cx={center}
                cy={center}
                r={segmentOuterR}
              >
                <stop offset="0%" stopColor={shadeHex(base, 1.06)} />
                <stop offset="70%" stopColor={base} />
                <stop offset="100%" stopColor={shadeHex(base, 0.9)} />
              </radialGradient>
            )
          })}
        </defs>

        <g filter={`url(#${gradientId}-shadow)`}>
          <ellipse
            cx={center}
            cy={center + outerR * 0.06}
            rx={outerR * 0.78}
            ry={outerR * 0.09}
            fill="rgba(0,0,0,0.16)"
          />

          <g
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: `${center}px ${center}px`,
              transition: isAnimating
                ? 'transform 3800ms cubic-bezier(0.12, 0.75, 0.1, 1)'
                : 'none',
            }}
          >
            {/* Pie segments */}
            {geometries.map((sector) => (
              <path
                key={sector.id}
                d={describeArcSegment(
                  center,
                  center,
                  segmentInnerR,
                  segmentOuterR - scaledPx(1, scale),
                  sector.startAngle,
                  sector.endAngle,
                )}
                fill={`url(#${sectorGradientId(sector.id)})`}
              />
            ))}

            {/* Gold transition at segment / rim boundary */}
            <circle
              cx={center}
              cy={center}
              r={segmentOuterR - scaledPx(1, scale)}
              fill="none"
              stroke={PREMIUM_WHEEL_COLORS.goldDeep}
              strokeWidth={scaledPx(3, scale)}
              opacity={0.35}
            />

            {/* Dark dividers */}
            {boundaryAngles.map((angle, index) => (
              <path
                key={`divider-${index}`}
                d={describeSegmentDivider(
                  center,
                  center,
                  segmentInnerR,
                  segmentOuterR - scaledPx(2, scale),
                  angle,
                )}
                stroke={PREMIUM_WHEEL_COLORS.divider}
                strokeWidth={scaledPx(1.2, scale)}
                strokeLinecap="round"
              />
            ))}

            {/* Labels */}
            {geometries.map((sector) => {
              if (!shouldShowSectorLabel(sector.startAngle, sector.endAngle, 16)) {
                return null
              }

              const labelRadius = segmentInnerR + (segmentOuterR - segmentInnerR) * 0.58
              const angle = sector.midAngle
              const radians = (angle * Math.PI) / 180
              const x = center + labelRadius * Math.cos(radians)
              const y = center + labelRadius * Math.sin(radians)
              const flip = angle > 90 && angle < 270
              const textRotation = flip ? angle + 180 : angle
              const labelColor = sectorLabelColor(sector.color)
              const fontSize = scaledPx(13, scale)

              return (
                <text
                  key={`label-${sector.id}`}
                  x={x}
                  y={y}
                  fill={labelColor}
                  fontSize={fontSize}
                  fontWeight={800}
                  fontFamily={`${theme.fontFamily}, Arial, sans-serif`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textRotation}, ${x}, ${y})`}
                  style={{
                    pointerEvents: 'none',
                    letterSpacing: '0.03em',
                  }}
                >
                  {truncateSectorLabel(sector.label, 14)}
                </text>
              )
            })}

            {/* Solid gold rim band */}
            <path
              d={describeDonut(center, center, outerR, segmentOuterR)}
              fill={`url(#${gradientId}-gold-rim-fill)`}
              fillRule="evenodd"
            />
            <circle
              cx={center}
              cy={center}
              r={outerR - scaledPx(1, scale)}
              fill="none"
              stroke={PREMIUM_WHEEL_COLORS.goldLight}
              strokeWidth={scaledPx(2, scale)}
              opacity={0.85}
            />
            <circle
              cx={center}
              cy={center}
              r={segmentOuterR + scaledPx(1, scale)}
              fill="none"
              stroke={PREMIUM_WHEEL_COLORS.goldMid}
              strokeWidth={scaledPx(1.5, scale)}
              opacity={0.7}
            />
            <circle
              cx={center}
              cy={center}
              r={outerR - scaledPx(2, scale)}
              fill="none"
              stroke={`url(#${gradientId}-gold-rim-shine)`}
              strokeWidth={scaledPx(3, scale)}
              opacity={0.75}
            />
            {/* Rim highlights — outer edge */}
            {RIM_OUTER_HIGHLIGHTS.map((spot, index) => (
              <path
                key={`rim-hl-outer-${index}`}
                d={describeArcStroke(
                  center,
                  center,
                  outerR - scaledPx(spot.outerOffset, scale),
                  spot.angle - spot.span / 2,
                  spot.angle + spot.span / 2,
                )}
                fill="none"
                stroke={`rgba(255, 236, 140, ${spot.opacity})`}
                strokeWidth={scaledPx(spot.width, scale)}
                strokeLinecap="round"
              />
            ))}

            {/* Rim highlights — inner edge */}
            {RIM_INNER_HIGHLIGHTS.map((spot, index) => (
              <path
                key={`rim-hl-inner-${index}`}
                d={describeArcStroke(
                  center,
                  center,
                  segmentOuterR + scaledPx(3, scale),
                  spot.angle - spot.span / 2,
                  spot.angle + spot.span / 2,
                )}
                fill="none"
                stroke={`rgba(255, 215, 80, ${spot.opacity})`}
                strokeWidth={scaledPx(spot.width, scale)}
                strokeLinecap="round"
              />
            ))}

            {/* Point glints on rim */}
            {RIM_GLINT_ANGLES.map((angle, index) => {
              const glint = polarToCartesian(center, center, rimMidR, angle)
              const rx = scaledPx(5, scale)
              const ry = scaledPx(2.2, scale)
              return (
                <ellipse
                  key={`rim-glint-${index}`}
                  cx={glint.x}
                  cy={glint.y}
                  rx={rx}
                  ry={ry}
                  fill="rgba(255, 248, 200, 0.7)"
                  transform={`rotate(${angle + 90}, ${glint.x}, ${glint.y})`}
                />
              )
            })}

            {/* Gold studs on rim */}
            {rimStudAngles(RIM_GEM_COUNT).map((angle, index) => {
              const stud = polarToCartesian(center, center, rimMidR, angle)
              return (
                <g key={`stud-${index}`}>
                  <circle
                    cx={stud.x + scaledPx(0.3, scale)}
                    cy={stud.y + scaledPx(0.5, scale)}
                    r={studRadius + scaledPx(0.4, scale)}
                    fill="rgba(139, 105, 20, 0.35)"
                  />
                  <circle
                    cx={stud.x}
                    cy={stud.y}
                    r={studRadius}
                    fill={`url(#${gradientId}-gold-stud)`}
                    stroke={PREMIUM_WHEEL_COLORS.goldDeep}
                    strokeWidth={scaledPx(0.5, scale)}
                  />
                  <circle
                    cx={stud.x - studRadius * 0.28}
                    cy={stud.y - studRadius * 0.3}
                    r={studRadius * 0.3}
                    fill="rgba(255, 253, 231, 0.75)"
                  />
                </g>
              )
            })}

            {/* Brushed-metal hub */}
            <circle
              cx={center}
              cy={center}
              r={hubRadius + scaledPx(2, scale)}
              fill="none"
              stroke={PREMIUM_WHEEL_COLORS.goldDeep}
              strokeWidth={scaledPx(2, scale)}
              opacity={0.5}
            />
            <circle
              cx={center}
              cy={center}
              r={hubRadius}
              fill={`url(#${gradientId}-hub)`}
              stroke={PREMIUM_WHEEL_COLORS.hubStroke}
              strokeWidth={scaledPx(2, scale)}
            />
            {Array.from({ length: 12 }, (_, index) => {
              const angle = index * 30 - 90
              const inner = polarToCartesian(center, center, hubRadius * 0.25, angle)
              const outer = polarToCartesian(center, center, hubRadius * 0.92, angle)
              return (
                <line
                  key={`hub-brush-${index}`}
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth={scaledPx(0.8, scale)}
                />
              )
            })}
            <ellipse
              cx={center - hubRadius * 0.18}
              cy={center - hubRadius * 0.28}
              rx={hubRadius * 0.42}
              ry={hubRadius * 0.24}
              fill="rgba(255,255,255,0.45)"
            />
            <circle
              cx={center}
              cy={center}
              r={hubRadius * 0.18}
              fill={PREMIUM_WHEEL_COLORS.goldDeep}
              stroke={PREMIUM_WHEEL_COLORS.goldDark}
              strokeWidth={scaledPx(0.5, scale)}
            />
          </g>
        </g>

        {/* Fixed pointer bracket + red arrow */}
        <g transform={`translate(${center} ${center - outerR})`}>
          <g
            style={{
              transform: `scale(${pointerBounce ? 1.1 : 1})`,
              transformOrigin: '0px 0px',
              transition: 'transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Gold bracket over rim */}
            <path
              d={`
                M ${-pointerWidth * 0.9} ${scaledPx(6, scale)}
                Q 0 ${-scaledPx(4, scale)} ${pointerWidth * 0.9} ${scaledPx(6, scale)}
                L ${pointerWidth * 0.7} ${scaledPx(10, scale)}
                Q 0 ${scaledPx(2, scale)} ${-pointerWidth * 0.7} ${scaledPx(10, scale)}
                Z
              `}
              fill={`url(#${gradientId}-gold-bracket)`}
              stroke={PREMIUM_WHEEL_COLORS.goldDeep}
              strokeWidth={scaledPx(1, scale)}
            />

            {/* Red pointer arrow */}
            <path
              d={`M 0 ${pointerHeight} L ${-pointerWidth / 2} ${scaledPx(8, scale)} L ${pointerWidth / 2} ${scaledPx(8, scale)} Z`}
              fill={`url(#${gradientId}-pointer-red)`}
              stroke="#FFFFFF"
              strokeWidth={scaledPx(2, scale)}
              strokeLinejoin="round"
            />
            <path
              d={`M ${-pointerWidth * 0.12} ${pointerHeight * 0.75} L ${-pointerWidth * 0.05} ${scaledPx(10, scale)} L ${pointerWidth * 0.05} ${scaledPx(10, scale)} L ${pointerWidth * 0.12} ${pointerHeight * 0.75} Z`}
              fill="rgba(255,255,255,0.25)"
            />
          </g>
        </g>
      </Box>
    </Box>
  )
}
