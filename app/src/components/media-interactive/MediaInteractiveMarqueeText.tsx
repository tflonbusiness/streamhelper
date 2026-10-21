import { Box } from '@mui/material'
import { keyframes, styled } from '@mui/material/styles'
import { useEffect, useRef, useState } from 'react'

type MediaInteractiveMarqueeTextProps = {
  text: string
  className?: string
}

const marquee = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`

const StyledViewport = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'fadeEdges',
})<{ fadeEdges?: boolean }>(({ fadeEdges }) => ({
  overflow: 'hidden',
  width: '100%',
  minWidth: 0,
  ...(fadeEdges
    ? {
        WebkitMaskImage:
          'linear-gradient(90deg, transparent 0, #000 8px, #000 calc(100% - 8px), transparent 100%)',
        maskImage:
          'linear-gradient(90deg, transparent 0, #000 8px, #000 calc(100% - 8px), transparent 100%)',
      }
    : {}),
}))

const StyledTrack = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'animate',
})<{ animate?: boolean }>(({ animate }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2rem',
  whiteSpace: 'nowrap',
  width: animate ? 'max-content' : '100%',
  animation: animate ? `${marquee} 14s linear infinite` : 'none',
  '&:hover': animate
    ? {
        animationPlayState: 'paused',
      }
    : undefined,
}))

const StyledSegment = styled('span')({
  display: 'inline-block',
  flexShrink: 0,
})

export function MediaInteractiveMarqueeText({
  text,
  className,
}: MediaInteractiveMarqueeTextProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const [overflows, setOverflows] = useState(false)

  useEffect(() => {
    const viewport = viewportRef.current
    const measure = measureRef.current
    if (!viewport || !measure) {
      return
    }
    const check = () => {
      setOverflows(measure.scrollWidth > viewport.clientWidth + 1)
    }
    check()
    const observer = new ResizeObserver(check)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [text])

  return (
    <StyledViewport ref={viewportRef} className={className} fadeEdges={overflows}>
      <StyledTrack animate={overflows}>
        <StyledSegment ref={measureRef}>{text}</StyledSegment>
        {overflows ? <StyledSegment aria-hidden>{text}</StyledSegment> : null}
      </StyledTrack>
    </StyledViewport>
  )
}
