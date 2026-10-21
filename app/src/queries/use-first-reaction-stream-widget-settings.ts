import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchFirstReactionWidget,
  patchFirstReactionWidget,
} from '@/api/first-reaction'
import { firstReactionKeys } from '@/queries/keys'

export function useFirstReactionWidget(accountId: number | undefined) {
  return useQuery({
    queryKey: firstReactionKeys.widget(accountId ?? 0),
    queryFn: () => fetchFirstReactionWidget(accountId!),
    enabled: accountId !== undefined,
  })
}

export function usePatchFirstReactionStreamWidgetSettings(
  accountId: number | undefined,
  accountUcid?: string,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      width?: number
      height?: number
      preset_id?: number
    }) => patchFirstReactionWidget(accountId!, body),
    onSuccess: () => {
      if (accountId !== undefined) {
        void queryClient.invalidateQueries({
          queryKey: firstReactionKeys.widget(accountId),
        })
      }
      if (accountUcid) {
        void queryClient.invalidateQueries({
          queryKey: firstReactionKeys.publicWidget(accountUcid),
        })
      }
    },
  })
}
