import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createFirstReaction,
  fetchFirstReactions,
  goLiveFirstReaction,
  type FirstReactionArchivedFilter,
} from '@/api/first-reaction'
import { firstReactionKeys } from '@/queries/keys'

export function useFirstReactions(
  accountId: number | undefined,
  params: {
    archived: FirstReactionArchivedFilter
    page: number
    limit: number
  },
) {
  return useQuery({
    queryKey: firstReactionKeys.list(accountId ?? 0, params),
    queryFn: () => fetchFirstReactions(accountId!, params),
    enabled: accountId !== undefined,
  })
}

export function useCreateFirstReaction(accountId: number | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (title: string) => createFirstReaction(accountId!, title),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: firstReactionKeys.lists() })
    },
  })
}

export function useGoLiveFirstReaction(accountId: number | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (firstReactionId: number) =>
      goLiveFirstReaction(accountId!, firstReactionId),
    onSuccess: (_data, firstReactionId) => {
      void queryClient.invalidateQueries({ queryKey: firstReactionKeys.lists() })
      void queryClient.invalidateQueries({
        queryKey: firstReactionKeys.session(accountId!, firstReactionId),
      })
    },
  })
}
