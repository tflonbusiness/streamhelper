import type { WheelSectorGeometry } from '@/lib/prize-spin-wheel-geometry'
import { truncateSectorLabel } from '@/lib/prize-spin-wheel-geometry'

const DEG = Math.PI / 180

/** Center hub icon — stream-helper `stream_icon` flame fallback (🔥). */
export function drawWheelCenterIcon(
  ctx: CanvasRenderingContext2D,
  center: number,
): void {
  ctx.save()
  ctx.translate(center, center)
  ctx.font = '26px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🔥', 0, 1)
  ctx.restore()
}

/**
 * stream-helper `drawStaticWheel` with variable sector arcs (`winPercent`).
 * `angleRadians` — cumulative wheel rotation (clockwise positive).
 */
export function drawPrizeSpinWheelCanvas(
  ctx: CanvasRenderingContext2D,
  size: number,
  sectors: WheelSectorGeometry[],
  angleRadians: number,
): void {
  const totalSectors = sectors.length
  if (totalSectors === 0) {
    return
  }

  const center = size / 2
  const radius = center - 24

  ctx.clearRect(0, 0, size, size)

  for (const sector of sectors) {
    const sweep = (sector.endAngle - sector.startAngle) * DEG
    const sectorAngle = angleRadians + sector.startAngle * DEG

    ctx.beginPath()
    ctx.moveTo(center, center)
    ctx.arc(center, center, radius, sectorAngle, sectorAngle + sweep)
    ctx.closePath()

    ctx.fillStyle = sector.color || '#3F3F46'
    ctx.fill()

    const gradient = ctx.createLinearGradient(center, center - radius, center, center + radius)
    gradient.addColorStop(0, 'rgba(255,255,255,0.12)')
    gradient.addColorStop(0.45, 'rgba(255,255,255,0)')
    gradient.addColorStop(1, 'rgba(0,0,0,0.18)')
    ctx.fillStyle = gradient
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(center, center)
    ctx.lineTo(
      center + Math.cos(sectorAngle) * radius,
      center + Math.sin(sectorAngle) * radius,
    )
    ctx.strokeStyle = 'rgba(255,255,255,0.28)'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.save()
    ctx.translate(center, center)
    ctx.rotate(sectorAngle + sweep / 2)
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'

    let fontSize = 17
    if (sector.label.length > 12) {
      fontSize = 14
    }
    if (sector.label.length > 18) {
      fontSize = 12
    }

    ctx.font = `800 ${fontSize}px Arial, sans-serif`
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(truncateSectorLabel(sector.label, 18), radius - 28, 0)
    ctx.restore()
  }

  ctx.save()
  ctx.beginPath()
  ctx.arc(center, center, radius, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,255,255,0.20)'
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.restore()

  ctx.save()
  ctx.beginPath()
  ctx.arc(center, center, 39, 0, Math.PI * 2)
  ctx.fillStyle = '#111318'
  ctx.fill()
  ctx.restore()

  ctx.beginPath()
  ctx.arc(center, center, 36, 0, Math.PI * 2)
  ctx.fillStyle = '#17191F'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.16)'
  ctx.lineWidth = 3
  ctx.stroke()

  drawWheelCenterIcon(ctx, center)
}

/** stream-helper spin easing: `1 - (1 - t)^4.5` */
export function streamHelperSpinEase(progress: number): number {
  return 1 - Math.pow(1 - progress, 4.5)
}

export function degreesToRadians(degrees: number): number {
  return degrees * DEG
}

export function radiansToDegrees(radians: number): number {
  return radians / DEG
}
