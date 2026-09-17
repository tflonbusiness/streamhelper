export const FORTUNE_WHEEL_COLORS = {
  frameRed: '#D32F2F',
  frameRedDark: '#9A1B1B',
  frameRedLight: '#EF5350',
  goldLight: '#FFE082',
  goldMid: '#FFC107',
  goldDark: '#E65100',
  stud: '#FFD54F',
  studStroke: '#F57F17',
  notch: '#FFFFFF',
  hubShadow: '#8D6E00',
} as const

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
  return `fortune-sector-${sectorId}`
}

export function describeFrameNotch(
  centerX: number,
  centerY: number,
  innerRadius: number,
  angle: number,
  depth: number,
  halfWidthDegrees: number,
): string {
  const tip = polar(centerX, centerY, innerRadius, angle)
  const left = polar(centerX, centerY, innerRadius - depth, angle - halfWidthDegrees)
  const right = polar(centerX, centerY, innerRadius - depth, angle + halfWidthDegrees)
  return `M ${tip.x} ${tip.y} L ${left.x} ${left.y} L ${right.x} ${right.y} Z`
}

function polar(
  centerX: number,
  centerY: number,
  radius: number,
  angleDegrees: number,
): { x: number; y: number } {
  const radians = (angleDegrees * Math.PI) / 180
  return {
    x: centerX + radius * Math.cos(radians),
    y: centerY + radius * Math.sin(radians),
  }
}
