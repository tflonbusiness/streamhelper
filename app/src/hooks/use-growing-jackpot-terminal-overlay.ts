import { useEffect, useState } from 'react'
import type { PublicGrowingJackpotWidget } from '@/api/growing-jackpot'

/** Hides winner / no_participants overlay after winnerOverlaySeconds from closedAt. */
export function useGrowingJackpotTerminalOverlay(
  view: PublicGrowingJackpotWidget | undefined,
): PublicGrowingJackpotWidget | undefined {
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    setExpired(false)
    if (
      !view ||
      (view.status !== 'winner' && view.status !== 'no_participants')
    ) {
      return
    }
    const closedAt = view.round.closedAt
    if (!closedAt) {
      return
    }
    const seconds = view.settings.winnerOverlaySeconds
    const endMs = new Date(closedAt).getTime() + seconds * 1000
    const remaining = endMs - Date.now()
    if (remaining <= 0) {
      setExpired(true)
      return
    }
    const id = window.setTimeout(() => setExpired(true), remaining)
    return () => window.clearTimeout(id)
  }, [view])

  if (!view || !expired) {
    return view
  }

  if (view.status === 'winner' || view.status === 'no_participants') {
    return {
      status: 'idle',
      width: view.width,
      height: view.height,
      style: view.style,
      growingJackpotId: view.round.growingJackpotId,
    }
  }

  return view
}
