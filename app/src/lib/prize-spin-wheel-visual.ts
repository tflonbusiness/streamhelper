import { polarToCartesian } from '@/lib/prize-spin-wheel-geometry'

export const PREMIUM_WHEEL_COLORS = {
  goldLight: '#FFF8E1',
  goldMid: '#FFC107',
  goldDark: '#B8860B',
  goldDeep: '#8B6914',
  ruby: '#C62828',
  rubyLight: '#EF5350',
  rubyDark: '#7F0000',
  pointerRed: '#D32F2F',
  pointerRedDark: '#B71C1C',
  divider: '#212121',
  hubStroke: '#8B6914',
} as const

/** @deprecated Use PREMIUM_WHEEL_COLORS */
export const FORTUNE_WHEEL_COLORS = PREMIUM_WHEEL_COLORS

export const RIM_GEM_COUNT = 20

export function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.trim().replace('#', '')
  if (normalized.length === 3) {
    return {
      r: Number.parseInt(normalized[0] + normalized[0], 16),
      g: Number.parseInt(normalized[1] + normalized[1], 16),
      b: Number.parseInt(normalized[2] + normalized[2], 16),
    }
  }
  if (normalized.length === 6) {
    return {
      r: Number.parseInt(normalized.slice(0, 2), 16),
      g: Number.parseInt(normalized.slice(2, 4), 16),
      b: Number.parseInt(normalized.slice(4, 6), 16),
    }
  }
  return null
}

export function shadeHex(hex: string, factor: number): string {
  const rgb = parseHexColor(hex)
  if (!rgb) {
    return hex
  }

  const clamp = (value: number) => Math.min(255, Math.max(0, Math.round(value)))
  const r = clamp(rgb.r * factor)
  const g = clamp(rgb.g * factor)
  const b = clamp(rgb.b * factor)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export function sectorLabelColor(hex: string): string {
  const rgb = parseHexColor(hex)
  if (!rgb) {
    return '#FFFFFF'
  }

  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance > 0.62 ? '#1A1A1A' : '#FFFFFF'
}

export function sectorGradientId(sectorId: number): string {
  return `premium-sector-${sectorId}`
}

export function describeArcStroke(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(centerX, centerY, radius, startAngle)
  const end = polarToCartesian(centerX, centerY, radius, endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

export function describeSegmentDivider(
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  angle: number,
): string {
  const inner = polarToCartesian(centerX, centerY, innerRadius, angle)
  const outer = polarToCartesian(centerX, centerY, outerRadius, angle)
  return `M ${inner.x} ${inner.y} L ${outer.x} ${outer.y}`
}

export function rimStudAngles(count = RIM_GEM_COUNT): number[] {
  return Array.from({ length: count }, (_, index) => -90 + (360 / count) * index)
}

/** Filled annulus path (even-odd) for a solid gold rim band. */
export function describeDonut(
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
): string {
  return [
    `M ${centerX + outerRadius} ${centerY}`,
    `A ${outerRadius} ${outerRadius} 0 1 1 ${centerX - outerRadius} ${centerY}`,
    `A ${outerRadius} ${outerRadius} 0 1 1 ${centerX + outerRadius} ${centerY}`,
    `M ${centerX + innerRadius} ${centerY}`,
    `A ${innerRadius} ${innerRadius} 0 1 0 ${centerX - innerRadius} ${centerY}`,
    `A ${innerRadius} ${innerRadius} 0 1 0 ${centerX + innerRadius} ${centerY}`,
  ].join(' ')
}

export type RimHighlightSpot = {
  angle: number
  span: number
  outerOffset: number
  opacity: number
  width: number
}

/** Specular arc highlights on the outer gold rim. */
export const RIM_OUTER_HIGHLIGHTS: RimHighlightSpot[] = [
  { angle: -90, span: 58, outerOffset: 3, opacity: 0.58, width: 3 },
  { angle: -18, span: 34, outerOffset: 2, opacity: 0.4, width: 2.2 },
  { angle: 52, span: 40, outerOffset: 2, opacity: 0.34, width: 2 },
  { angle: 128, span: 44, outerOffset: 2, opacity: 0.32, width: 1.9 },
  { angle: 205, span: 38, outerOffset: 2, opacity: 0.28, width: 1.7 },
  { angle: 248, span: 30, outerOffset: 3, opacity: 0.22, width: 1.5 },
]

/** Softer inner-edge highlights on the gold rim. */
export const RIM_INNER_HIGHLIGHTS: RimHighlightSpot[] = [
  { angle: -82, span: 48, outerOffset: 0, opacity: 0.28, width: 2.4 },
  { angle: 35, span: 36, outerOffset: 0, opacity: 0.2, width: 1.8 },
  { angle: 158, span: 40, outerOffset: 0, opacity: 0.18, width: 1.7 },
  { angle: 232, span: 32, outerOffset: 0, opacity: 0.16, width: 1.5 },
]

/** Point specular glints on the rim surface. */
export const RIM_GLINT_ANGLES = [-72, -8, 68, 142, 218, 272] as const
