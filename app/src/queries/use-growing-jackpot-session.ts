import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { GrowingJackpotSettings } from '@/api/growing-jackpot'
import {
  deactivateGrowingJackpot,
  fetchGrowingJackpotRounds,
  fetchGrowingJackpotSession,
  patchGrowingJackpotRoundFulfillment,
  patchGrowingJackpotSession,
  startGrowingJackpotRound,
  stopGrowingJackpotRound,
} from '@/api/growing-jackpot'
import { growingJackpotKeys } from '@/queries/keys'

export function useGrowingJackpotSession(
  accountId: number | undefined,
  growingJackpotId: number,
) {
  return useQuery({
    queryKey: growingJackpotKeys.session(accountId ?? 0, growingJackpotId),
    queryFn: () => fetchGrowingJackpotSession(accountId!, growingJackpotId),
    enabled: accountId !== undefined && Number.isFinite(growingJackpotId),
    refetchInterval: (query) => {
      const active = query.state.data?.activeRound
      if (active?.phase === 'accepting') {
        return 2000
      }
      return false
    },
  })
}

export function useGrowingJackpotRounds(
  accountId: number | undefined,
  growingJackpotId: number,
  page = 1,
  limit = 20,
  options?: { pollWhileAccepting?: boolean },
) {
  return useQuery({
    queryKey: growingJackpotKeys.rounds(
      accountId ?? 0,
      growingJackpotId,
      page,
      limit,
    ),
    queryFn: () =>
      fetchGrowingJackpotRounds(accountId!, growingJackpotId, page, limit),
    enabled: accountId !== undefined && Number.isFinite(growingJackpotId),
    refetchInterval: (query) => {
      if (!options?.pollWhileAccepting) {
        return false
      }
      const rounds = query.state.data?.rounds ?? []
      return rounds.some((round) => round.phase === 'accepting') ? 2000 : false
    },
  })
}

export function usePatchGrowingJackpotSession(
  accountId: number | undefined,
  growingJackpotId: number,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      title?: string
      settings?: Partial<GrowingJackpotSettings>
    }) => patchGrowingJackpotSession(accountId!, growingJackpotId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: growingJackpotKeys.session(accountId!, growingJackpotId),
      })
      void queryClient.invalidateQueries({
        queryKey: growingJackpotKeys.lists(),
      })
    },
  })
}

export function useDeactivateGrowingJackpot(
  accountId: number | undefined,
  growingJackpotId: number,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deactivateGrowingJackpot(accountId!, growingJackpotId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: growingJackpotKeys.session(accountId!, growingJackpotId),
      })
      void queryClient.invalidateQueries({
        queryKey: growingJackpotKeys.lists(),
      })
    },
  })
}

export function useStartGrowingJackpotRound(
  accountId: number | undefined,
  growingJackpotId: number,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => startGrowingJackpotRound(accountId!, growingJackpotId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: growingJackpotKeys.session(accountId!, growingJackpotId),
      })
      void queryClient.invalidateQueries({
        queryKey: growingJackpotKeys.roundsRoot(accountId!, growingJackpotId),
      })
    },
  })
}

export function useStopGrowingJackpotRound(
  accountId: number | undefined,
  growingJackpotId: number,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roundId: number) =>
      stopGrowingJackpotRound(accountId!, growingJackpotId, roundId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: growingJackpotKeys.session(accountId!, growingJackpotId),
      })
      void queryClient.invalidateQueries({
        queryKey: growingJackpotKeys.roundsRoot(accountId!, growingJackpotId),
      })
    },
  })
}

export function usePatchGrowingJackpotRoundFulfillment(
  accountId: number | undefined,
  growingJackpotId: number,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { roundId: number; status: 'pending' | 'fulfilled' }) =>
      patchGrowingJackpotRoundFulfillment(
        accountId!,
        growingJackpotId,
        input.roundId,
        input.status,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: growingJackpotKeys.roundsRoot(accountId!, growingJackpotId),
      })
    },
  })
}
