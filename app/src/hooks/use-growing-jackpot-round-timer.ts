import { useEffect, useState } from 'react'

export function useGrowingJackpotRoundTimer(
  endsAt: string | null,
  startedAt?: string | null,
) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!endsAt) {
      return
    }
    const id = window.setInterval(() => setNow(Date.now()), 100)
    return () => window.clearInterval(id)
  }, [endsAt])

  if (!endsAt) {
    return { secondsLeft: null, progress: null, urgent: false }
  }

  const deadlineMs = new Date(endsAt).getTime()
  const startedMs = startedAt ? new Date(startedAt).getTime() : null
  const remainingMs = deadlineMs - now
  const secondsLeft = Math.max(0, Math.ceil(remainingMs / 1000))

  let progress: number | null = null
  if (startedMs !== null && deadlineMs > startedMs) {
    progress = Math.min(
      1,
      Math.max(0, (now - startedMs) / (deadlineMs - startedMs)),
    )
  }

  return {
    secondsLeft,
    progress,
    urgent: secondsLeft > 0 && secondsLeft <= 10,
  }
}
