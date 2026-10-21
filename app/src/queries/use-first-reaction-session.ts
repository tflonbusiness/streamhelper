import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  archiveFirstReaction,
  deactivateFirstReaction,
  fetchFirstReactionDraws,
  fetchFirstReactionSession,
  patchFirstReaction,
  startFirstReactionDraw,
  stopFirstReactionDraw,
  type FirstReactionSettings,
} from '@/api/first-reaction'
import { firstReactionKeys } from '@/queries/keys'

const SESSION_POLL_MS = 2000

async function fetchSessionBundle(accountId: number, firstReactionId: number) {
  const [session, draws] = await Promise.all([
    fetchFirstReactionSession(accountId, firstReactionId),
    fetchFirstReactionDraws(accountId, firstReactionId),
  ])
  return { ...session, draws: draws.draws }
}

export function useFirstReactionSession(
  accountId: number | undefined,
  firstReactionId: number,
) {
  return useQuery({
    queryKey: firstReactionKeys.session(accountId ?? 0, firstReactionId),
    queryFn: () => fetchSessionBundle(accountId!, firstReactionId),
    enabled: accountId !== undefined && Number.isFinite(firstReactionId),
    refetchInterval: (query) => {
      const active = query.state.data?.activeDraw
      if (active?.phase === 'accepting') {
        return SESSION_POLL_MS
      }
      return false
    },
  })
}

function useInvalidateSession(accountId: number | undefined) {
  const queryClient = useQueryClient()
  return (firstReactionId: number) => {
    if (accountId === undefined) return
    void queryClient.invalidateQueries({
      queryKey: firstReactionKeys.session(accountId, firstReactionId),
    })
  }
}

export function usePatchFirstReactionSession(
  accountId: number | undefined,
  firstReactionId: number,
) {
  const invalidate = useInvalidateSession(accountId)
  return useMutation({
    mutationFn: (body: {
      title?: string
      settings?: Partial<FirstReactionSettings>
    }) => patchFirstReaction(accountId!, firstReactionId, body),
    onSuccess: () => invalidate(firstReactionId),
  })
}

export function useDeactivateFirstReaction(
  accountId: number | undefined,
  firstReactionId: number,
) {
  const invalidate = useInvalidateSession(accountId)
  return useMutation({
    mutationFn: () => deactivateFirstReaction(accountId!, firstReactionId),
    onSuccess: () => invalidate(firstReactionId),
  })
}

export function useArchiveFirstReaction(accountId: number | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (firstReactionId: number) =>
      archiveFirstReaction(accountId!, firstReactionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: firstReactionKeys.lists() })
    },
  })
}

export function useStartFirstReactionDraw(
  accountId: number | undefined,
  firstReactionId: number,
) {
  const invalidate = useInvalidateSession(accountId)
  return useMutation({
    mutationFn: (keyword?: string) =>
      startFirstReactionDraw(accountId!, firstReactionId, {
        keyword,
      }),
    onSuccess: () => invalidate(firstReactionId),
  })
}

export function useStopFirstReactionDraw(
  accountId: number | undefined,
  firstReactionId: number,
) {
  const invalidate = useInvalidateSession(accountId)
  return useMutation({
    mutationFn: (drawId: number) =>
      stopFirstReactionDraw(accountId!, firstReactionId, drawId),
    onSuccess: () => invalidate(firstReactionId),
  })
}
