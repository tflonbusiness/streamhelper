import { useEffect, useRef, useState } from 'react'

type VisibilityPhase = 'hidden' | 'entering' | 'visible' | 'exiting'

export function useFirstReactionWidgetVisibility(shouldShow: boolean) {
  const [phase, setPhase] = useState<VisibilityPhase>(
    shouldShow ? 'entering' : 'hidden',
  )
  const wasShowingRef = useRef(shouldShow)

  useEffect(() => {
    if (shouldShow && !wasShowingRef.current) {
      setPhase('entering')
    } else if (!shouldShow && wasShowingRef.current) {
      setPhase((current) =>
        current === 'hidden' ? 'hidden' : 'exiting',
      )
    }
    wasShowingRef.current = shouldShow
  }, [shouldShow])

  useEffect(() => {
    if (shouldShow && phase === 'hidden') {
      setPhase('entering')
    }
  }, [shouldShow, phase])

  const handleAnimationEnd = () => {
    if (phase === 'entering') {
      setPhase('visible')
    } else if (phase === 'exiting') {
      setPhase('hidden')
    }
  }

  const isRendered = phase !== 'hidden'

  return { phase, isRendered, handleAnimationEnd }
}
