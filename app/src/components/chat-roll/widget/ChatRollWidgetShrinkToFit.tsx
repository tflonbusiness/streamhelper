import { Box } from '@mui/material'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

type ChatRollWidgetShrinkToFitProps = {
  children: ReactNode
}

export function ChatRollWidgetShrinkToFit(props: ChatRollWidgetShrinkToFitProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) {
      return
    }

    const fit = () => {
      const widthAvailable = container.clientWidth
      const heightAvailable = container.clientHeight
      const widthNeeded = content.scrollWidth
      const heightNeeded = content.scrollHeight
      if (
        widthAvailable <= 0 ||
        heightAvailable <= 0 ||
        widthNeeded <= 0 ||
        heightNeeded <= 0
      ) {
        setScale(1)
        return
      }
      setScale(
        Math.min(
          1,
          widthAvailable / widthNeeded,
          heightAvailable / heightNeeded,
        ),
      )
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(container)
    observer.observe(content)
    return () => observer.disconnect()
  }, [props.children])

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        ref={contentRef}
        sx={{
          display: 'inline-block',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          maxWidth: 'none',
        }}
      >
        {props.children}
      </Box>
    </Box>
  )
}
