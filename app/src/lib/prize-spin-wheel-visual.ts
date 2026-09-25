import { polarToCartesian } from '@/lib/prize-spin-wheel-geometry'

/** stream-helper OBSWheelOverlayPage `drawStaticWheel` palette */
export const STREAM_HELPER_WHEEL = {
  divider: 'rgba(255,255,255,0.28)',
  outerRing: 'rgba(255,255,255,0.20)',
  innerRing: 'rgba(0,0,0,0.20)',
  ambientRing: 'rgba(255,255,255,0.10)',
  hubOuterFill: '#111318',
  hubInnerFill: '#17191F',
  hubStroke: 'rgba(255,255,255,0.16)',
  pointerFill: '#FFFFFF',
  labelFill: '#FFFFFF',
  /** At 480px canvas reference */
  rimInset: 24,
  hubOuterRadius: 39,
  hubInnerRadius: 36,
} as const

export function sectorGlossGradientId(wheelKey: string): string {
  return `wheel-gloss-${wheelKey}`
}

export function sectorGradientId(sectorId: number): string {
  return `wheel-sector-${sectorId}`
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

export function labelFontSize(labelLength: number, scale: number): number {
  let size = 17
  if (labelLength > 12) {
    size = 14
  }
  if (labelLength > 18) {
    size = 12
  }
  return Math.round(size * scale)
}
