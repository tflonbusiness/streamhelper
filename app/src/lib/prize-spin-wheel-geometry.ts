import { defaultSectorColor } from '@/lib/prize-spin-sector-colors'

export type WheelSectorInput = {
  id: number
  label: string
  winPercent: string
  color: string | null
  sortOrder: number
}

export type WheelSectorGeometry = {
  id: number
  label: string
  color: string
  winPercent: number
  startAngle: number
  endAngle: number
  midAngle: number
}

const START_ANGLE = -90

export function buildWheelSectors(
  sectors: WheelSectorInput[],
): WheelSectorGeometry[] {
  let cursor = START_ANGLE

  return sectors.map((sector) => {
    const winPercent = Number.parseFloat(sector.winPercent)
    const sweep = (winPercent / 100) * 360
    const startAngle = cursor
    const endAngle = cursor + sweep
    const midAngle = startAngle + sweep / 2
    cursor = endAngle

    return {
      id: sector.id,
      label: sector.label,
      color: sector.color ?? defaultSectorColor(sector.sortOrder),
      winPercent,
      startAngle,
      endAngle,
      midAngle,
    }
  })
}

export function restRotationForSector(midAngle: number): number {
  const target = START_ANGLE - midAngle
  return ((target % 360) + 360) % 360
}

export function spinRotationFromCurrent(
  currentRotation: number,
  midAngle: number,
  fullRotations = 5,
): number {
  const target = restRotationForSector(midAngle)
  const currentMod = ((currentRotation % 360) + 360) % 360
  let delta = target - currentMod
  if (delta <= 0) {
    delta += 360
  }
  return currentRotation + fullRotations * 360 + delta
}

export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleDegrees: number,
): { x: number; y: number } {
  const angleRadians = (angleDegrees * Math.PI) / 180
  return {
    x: centerX + radius * Math.cos(angleRadians),
    y: centerY + radius * Math.sin(angleRadians),
  }
}

export function describeArcSegment(
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  const startOuter = polarToCartesian(centerX, centerY, outerRadius, startAngle)
  const endOuter = polarToCartesian(centerX, centerY, outerRadius, endAngle)
  const startInner = polarToCartesian(centerX, centerY, innerRadius, endAngle)
  const endInner = polarToCartesian(centerX, centerY, innerRadius, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ')
}

export function shouldShowSectorLabel(
  startAngle: number,
  endAngle: number,
  minDegrees = 18,
): boolean {
  return endAngle - startAngle >= minDegrees
}

export function truncateSectorLabel(label: string, maxLength = 14): string {
  if (label.length <= maxLength) {
    return label
  }
  return `${label.slice(0, maxLength - 1)}…`
}
