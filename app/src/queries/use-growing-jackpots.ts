import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  archiveGrowingJackpot,
  createGrowingJackpot,
  fetchGrowingJackpots,
  goLiveGrowingJackpot,
  type GrowingJackpotArchivedFilter,
} from '@/api/growing-jackpot'
import { growingJackpotKeys } from '@/queries/keys'

export function useGrowingJackpots(
  accountId: number | undefined,
  params: {
    archived: GrowingJackpotArchivedFilter
    page: number
    limit: number
  },
) {
  return useQuery({
    queryKey: growingJackpotKeys.list(accountId ?? 0, params),
    queryFn: () => fetchGrowingJackpots(accountId!, params),
    enabled: accountId !== undefined,
  })
}

export function useCreateGrowingJackpot(accountId: number | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (title: string) => createGrowingJackpot(accountId!, title),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: growingJackpotKeys.lists(),
      })
    },
  })
}

export function useArchiveGrowingJackpot(accountId: number | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (growingJackpotId: number) =>
      archiveGrowingJackpot(accountId!, growingJackpotId),
    onSuccess: (_data, growingJackpotId) => {
      void queryClient.invalidateQueries({
        queryKey: growingJackpotKeys.lists(),
      })
      void queryClient.invalidateQueries({
        queryKey: growingJackpotKeys.session(accountId!, growingJackpotId),
      })
    },
  })
}

export function useGoLiveGrowingJackpot(accountId: number | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (growingJackpotId: number) =>
      goLiveGrowingJackpot(accountId!, growingJackpotId),
    onSuccess: (_data, growingJackpotId) => {
      void queryClient.invalidateQueries({
        queryKey: growingJackpotKeys.lists(),
      })
      void queryClient.invalidateQueries({
        queryKey: growingJackpotKeys.session(accountId!, growingJackpotId),
      })
    },
  })
}
