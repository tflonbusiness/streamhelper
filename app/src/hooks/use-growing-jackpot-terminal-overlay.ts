import { useEffect, useState } from 'react'
import type { PublicGrowingJackpotWidget } from '@/api/growing-jackpot'

function mapNoParticipantsToIdle(
  view: PublicGrowingJackpotWidget,
): PublicGrowingJackpotWidget {
  if (view.status !== 'no_participants') {
    return view
  }
  return {
    status: 'idle',
    width: view.width,
    height: view.height,
    style: view.style,
    growingJackpotId: view.round.growingJackpotId,
  }
}

/** Hides winner overlay after winnerOverlaySeconds from closedAt. */
export function useGrowingJackpotTerminalOverlay(
  view: PublicGrowingJackpotWidget | undefined,
): PublicGrowingJackpotWidget | undefined {
  const [expired, setExpired] = useState(false)
  const activeView = view ? mapNoParticipantsToIdle(view) : undefined

  useEffect(() => {
    setExpired(false)
    if (!activeView || activeView.status !== 'winner') {
      return
    }
    const closedAt = activeView.round.closedAt
    if (!closedAt) {
      return
    }
    const seconds = activeView.settings.winnerOverlaySeconds
    const endMs = new Date(closedAt).getTime() + seconds * 1000
    const remaining = endMs - Date.now()
    if (remaining <= 0) {
      setExpired(true)
      return
    }
    const id = window.setTimeout(() => setExpired(true), remaining)
    return () => window.clearTimeout(id)
  }, [activeView])

  if (!activeView || !expired) {
    return activeView
  }

  if (activeView.status === 'winner') {
    return {
      status: 'idle',
      width: activeView.width,
      height: activeView.height,
      style: activeView.style,
      growingJackpotId: activeView.round.growingJackpotId,
    }
  }

  return activeView
}
