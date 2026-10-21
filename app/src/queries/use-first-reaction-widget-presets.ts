import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchFirstReactionWidgetPresets,
  upsertFirstReactionWidgetCustomPreset,
  type FirstReactionWidgetStyle,
} from '@/api/first-reaction'
import { firstReactionKeys } from '@/queries/keys'

export function useFirstReactionWidgetPresets(accountId: number | undefined) {
  return useQuery({
    queryKey: firstReactionKeys.presets(accountId ?? 0),
    queryFn: () => fetchFirstReactionWidgetPresets(accountId!),
    enabled: accountId !== undefined,
  })
}

export function useUpsertFirstReactionWidgetCustomPreset(
  accountId: number | undefined,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { style_settings: FirstReactionWidgetStyle }) =>
      upsertFirstReactionWidgetCustomPreset(accountId!, body),
    onSuccess: () => {
      if (accountId !== undefined) {
        void queryClient.invalidateQueries({
          queryKey: firstReactionKeys.presets(accountId),
        })
      }
    },
  })
}
