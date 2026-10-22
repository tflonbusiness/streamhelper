import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  archiveAllFirstReactionDraws,
  archiveFirstReaction,
  archiveFirstReactionDraw,
  deactivateFirstReaction,
  fetchFirstReactionDraws,
  fetchFirstReactionSession,
  patchFirstReaction,
  startFirstReactionDraw,
  stopFirstReactionDraw,
  type FirstReactionDrawListParams,
  type FirstReactionSettings,
} from '@/api/first-reaction'
import { firstReactionKeys } from '@/queries/keys'

const SESSION_POLL_MS = 2000

export function useFirstReactionSession(
  accountId: number | undefined,
  firstReactionId: number,
) {
  return useQuery({
    queryKey: firstReactionKeys.session(accountId ?? 0, firstReactionId),
    queryFn: () => fetchFirstReactionSession(accountId!, firstReactionId),
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
    void queryClient.invalidateQueries({
      queryKey: firstReactionKeys.drawsRoot(accountId, firstReactionId),
    })
  }
}

export function useFirstReactionDraws(
  accountId: number | undefined,
  firstReactionId: number,
  params: FirstReactionDrawListParams,
  options?: { pollWhileAccepting?: boolean },
) {
  return useQuery({
    queryKey: firstReactionKeys.draws(
      accountId ?? 0,
      firstReactionId,
      params,
    ),
    queryFn: () =>
      fetchFirstReactionDraws(accountId!, firstReactionId, params),
    enabled:
      accountId !== undefined && Number.isFinite(firstReactionId),
    placeholderData: (previous) => previous,
    refetchInterval: options?.pollWhileAccepting ? SESSION_POLL_MS : false,
  })
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

export function useArchiveFirstReactionDraw(
  accountId: number | undefined,
  firstReactionId: number,
) {
  const invalidate = useInvalidateSession(accountId)
  return useMutation({
    mutationFn: (drawId: number) =>
      archiveFirstReactionDraw(accountId!, firstReactionId, drawId),
    onSuccess: () => invalidate(firstReactionId),
  })
}

export function useArchiveAllFirstReactionDraws(
  accountId: number | undefined,
  firstReactionId: number,
) {
  const invalidate = useInvalidateSession(accountId)
  return useMutation({
    mutationFn: () =>
      archiveAllFirstReactionDraws(accountId!, firstReactionId),
    onSuccess: () => invalidate(firstReactionId),
  })
}
