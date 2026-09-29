import { Box } from '@mui/material'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

type BonusBuyWidgetShrinkToFitProps = {
  children: ReactNode
  gapPx?: number
}

export function BonusBuyWidgetShrinkToFit({
  children,
  gapPx = 8,
}: BonusBuyWidgetShrinkToFitProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    const fit = () => {
      const available = container.clientWidth
      const needed = content.scrollWidth
      if (available <= 0 || needed <= 0) {
        setScale(1)
        return
      }
      setScale(Math.min(1, available / needed))
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(container)
    observer.observe(content)
    return () => observer.disconnect()
  }, [children])

  return (
    <Box
      ref={containerRef}
      sx={{
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box
        ref={contentRef}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: `${gapPx}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'left center',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
