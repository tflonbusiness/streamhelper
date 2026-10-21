import { useEffect, useState } from 'react'

export type FirstReactionAcceptTimerState = {
  secondsLeft: number | null
  progress: number | null
  urgent: boolean
}

export function useFirstReactionAcceptTimer(
  acceptDeadlineAt: string | null,
  acceptingStartedAt: string | null,
): FirstReactionAcceptTimerState {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!acceptDeadlineAt) {
      return
    }
    const id = window.setInterval(() => setNow(Date.now()), 100)
    return () => window.clearInterval(id)
  }, [acceptDeadlineAt])

  if (!acceptDeadlineAt) {
    return { secondsLeft: null, progress: null, urgent: false }
  }

  const deadlineMs = new Date(acceptDeadlineAt).getTime()
  const startedMs = acceptingStartedAt
    ? new Date(acceptingStartedAt).getTime()
    : null
  const remainingMs = deadlineMs - now
  const secondsLeft = Math.max(0, Math.ceil(remainingMs / 1000))

  let progress: number | null = null
  if (startedMs !== null && deadlineMs > startedMs) {
    const elapsed = now - startedMs
    const total = deadlineMs - startedMs
    progress = Math.min(1, Math.max(0, elapsed / total))
  }

  return {
    secondsLeft,
    progress,
    urgent: secondsLeft > 0 && secondsLeft <= 3,
  }
}
