import { Box } from '@mui/material'
import { useEffect, useRef } from 'react'
import type { WheelSectorGeometry } from '@/lib/prize-spin-wheel-geometry'
import { drawPrizeSpinWheelCanvas } from '@/lib/prize-spin-wheel-canvas'

type PrizeSpinWheelCanvasProps = {
  sectors: WheelSectorGeometry[]
  angleRadians: number
  size: number
}

export function PrizeSpinWheelCanvas({
  sectors,
  angleRadians,
  size,
}: PrizeSpinWheelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    drawPrizeSpinWheelCanvas(ctx, size, sectors, angleRadians)
  }, [sectors, angleRadians, size])

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
      }}
    >
      <Box
        component="canvas"
        ref={canvasRef}
        width={size}
        height={size}
        sx={{
          display: 'block',
        }}
      />
    </Box>
  )
}
