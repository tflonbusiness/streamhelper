import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { moduleAccentColor } from '@/lib/module-accent-color'
import type { ModuleIconVariant, ModulePageId } from '@/lib/modules'

type ModuleIllustrationProps = {
  moduleId: ModulePageId
  variant?: ModuleIconVariant
}

function moduleVariantForId(id: ModulePageId): ModuleIconVariant {
  switch (id) {
    case 'bonus-buy':
      return 'warning'
    case 'prize-spin':
      return 'purple'
    case 'chat-roll':
      return 'info'
  }
}

function IllustrationFrame({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      sx={{
        width: '100%',
        height: '100%',
        display: 'block',
        overflow: 'visible',
      }}
      aria-hidden
    >
      {children}
    </Box>
  )
}

function annularWedgePath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startDeg: number,
  endDeg: number,
) {
  const toRad = (d: number) => (d * Math.PI) / 180
  const x1o = cx + rOuter * Math.cos(toRad(startDeg))
  const y1o = cy + rOuter * Math.sin(toRad(startDeg))
  const x2o = cx + rOuter * Math.cos(toRad(endDeg))
  const y2o = cy + rOuter * Math.sin(toRad(endDeg))
  const x2i = cx + rInner * Math.cos(toRad(endDeg))
  const y2i = cy + rInner * Math.sin(toRad(endDeg))
  const x1i = cx + rInner * Math.cos(toRad(startDeg))
  const y1i = cy + rInner * Math.sin(toRad(startDeg))
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${x1o} ${y1o} A ${rOuter} ${rOuter} 0 ${large} 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${rInner} ${rInner} 0 ${large} 0 ${x1i} ${y1i} Z`
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function BonusBuyIllustration({ accent }: { accent: string }) {
  return (
    <IllustrationFrame>
      <path
        d="M12 98 L28 94 L36 86 L44 88 L52 76 L60 78 L68 68 L76 72 L84 62 L92 66 L100 54 L108 58 L116 46 L124 50 L132 40"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <path
        d="M122 40 H132 V50"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />

      <g
        transform="translate(80 60) scale(2) translate(-12 -12)"
        stroke={accent}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <line x1="12" x2="12" y1="2" y2="22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </g>
    </IllustrationFrame>
  )
}

function PrizeWheelIllustration({ accent }: { accent: string }) {
  const cx = 96
  const cy = 74
  const rOuter = 40
  const rInner = 10
  const segments = 12
  const slice = 360 / segments
  const segmentFill = [0.44, 0.26, 0.38, 0.18]

  return (
    <IllustrationFrame>
      <circle
        cx={cx}
        cy={cy}
        r={rOuter + 2.5}
        stroke={accent}
        strokeWidth="3.5"
        fill="none"
        opacity={0.85}
      />
      <circle cx={cx} cy={cy} r={rOuter + 0.5} stroke={accent} strokeWidth="1" fill="none" opacity={0.35} />

      {Array.from({ length: segments }, (_, i) => {
        const start = -90 + i * slice
        const end = start + slice
        return (
          <path
            key={`seg-${i}`}
            d={annularWedgePath(cx, cy, rInner, rOuter, start, end)}
            fill={accent}
            fillOpacity={segmentFill[i % segmentFill.length]}
            stroke="none"
          />
        )
      })}

      {Array.from({ length: segments }, (_, i) => {
        const deg = -90 + i * slice
        const outer = polar(cx, cy, rOuter, deg)
        const inner = polar(cx, cy, rInner, deg)
        return (
          <line
            key={`spoke-${i}`}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke={accent}
            strokeWidth="1.25"
            opacity={0.65}
          />
        )
      })}

      <circle cx={cx} cy={cy} r="8" fill={accent} fillOpacity={0.4} stroke={accent} strokeWidth="2" />
      <circle cx={cx} cy={cy} r="2.5" fill={accent} />

      <polygon
        points={`${cx - 8},${cy - rOuter - 10} ${cx + 8},${cy - rOuter - 10} ${cx},${cy - rOuter + 5}`}
        fill={accent}
        stroke={accent}
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </IllustrationFrame>
  )
}

function ChatRollIllustration({ accent }: { accent: string }) {
  return (
    <IllustrationFrame>
      <path
        d="M36 58 H98 a10 10 0 0 1 10 10 V80 a10 10 0 0 1-10 10 H64 L52 102 V92 H36 a10 10 0 0 1-10-10 V68 a10 10 0 0 1 10-10 Z"
        stroke={accent}
        strokeWidth="2"
        fill={accent}
        fillOpacity="0.13"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="72" r="6" stroke={accent} strokeWidth="1.75" fill={accent} fillOpacity="0.2" />
      <path
        d="M62 70 H90 M62 76 H82 M62 82 H86"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.48"
      />

      <path
        d="M104 86 L110 68"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="3 4"
        opacity="0.35"
      />

      <path
        d="M104 34 H132 V38 H104 Z"
        fill={accent}
        fillOpacity="0.4"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M106 38 H130 L126 66 H110 Z"
        stroke={accent}
        strokeWidth="2"
        fill={accent}
        fillOpacity="0.3"
        strokeLinejoin="round"
      />
      <path d="M110 46 H126 M112 54 H124" stroke={accent} strokeWidth="1.5" opacity="0.35" />

      <path
        d="M118 48 L121 54 H125 L122 57 L123 62 L118 59 L113 62 L114 57 L111 54 H115 Z"
        fill={accent}
        opacity="0.82"
      />

      <path d="M118 66 V76" stroke={accent} strokeWidth="2.75" strokeLinecap="round" />
      <rect
        x="112"
        y="76"
        width="12"
        height="4"
        fill={accent}
        fillOpacity="0.38"
        stroke={accent}
        strokeWidth="1.25"
      />
      <rect
        x="106"
        y="80"
        width="24"
        height="5"
        fill={accent}
        fillOpacity="0.28"
        stroke={accent}
        strokeWidth="1.5"
      />
      <rect
        x="100"
        y="85"
        width="36"
        height="6"
        fill={accent}
        fillOpacity="0.18"
        stroke={accent}
        strokeWidth="1.5"
      />
    </IllustrationFrame>
  )
}

export function ModuleIllustration({ moduleId, variant }: ModuleIllustrationProps) {
  const theme = useTheme()
  const accent = moduleAccentColor(variant ?? moduleVariantForId(moduleId), theme)

  switch (moduleId) {
    case 'bonus-buy':
      return <BonusBuyIllustration accent={accent} />
    case 'prize-spin':
      return <PrizeWheelIllustration accent={accent} />
    case 'chat-roll':
      return <ChatRollIllustration accent={accent} />
  }
}
