import { useEffect, useRef, useState } from 'react'

type VisibilityPhase = 'hidden' | 'entering' | 'visible' | 'exiting'

export function useFirstReactionWidgetVisibility(isAccepting: boolean) {
  const [phase, setPhase] = useState<VisibilityPhase>(
    isAccepting ? 'entering' : 'hidden',
  )
  const wasAcceptingRef = useRef(isAccepting)

  useEffect(() => {
    if (isAccepting && !wasAcceptingRef.current) {
      setPhase('entering')
    } else if (!isAccepting && wasAcceptingRef.current) {
      setPhase((current) =>
        current === 'hidden' ? 'hidden' : 'exiting',
      )
    }
    wasAcceptingRef.current = isAccepting
  }, [isAccepting])

  useEffect(() => {
    if (isAccepting && phase === 'hidden') {
      setPhase('entering')
    }
  }, [isAccepting, phase])

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
