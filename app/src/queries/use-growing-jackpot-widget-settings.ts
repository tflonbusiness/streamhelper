import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchGrowingJackpotWidget,
  patchGrowingJackpotWidget,
  type GrowingJackpotWidgetStyle,
} from '@/api/growing-jackpot'
import { growingJackpotKeys } from '@/queries/keys'

export function useGrowingJackpotWidget(
  accountId: number | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: growingJackpotKeys.widget(accountId ?? 0),
    queryFn: () => fetchGrowingJackpotWidget(accountId!),
    enabled: accountId !== undefined && enabled,
  })
}

export function usePatchGrowingJackpotWidget(accountId: number | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      width?: number
      height?: number
      style?: Partial<GrowingJackpotWidgetStyle>
    }) => patchGrowingJackpotWidget(accountId!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: growingJackpotKeys.widget(accountId ?? 0),
      })
      void queryClient.invalidateQueries({
        queryKey: [...growingJackpotKeys.all, 'publicWidget'],
      })
    },
  })
}
