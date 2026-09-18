import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  archivePrizeSpin,
  createPrizeSpin,
  deactivatePrizeSpin,
  fetchPrizeSpinWidget,
  fetchPrizeSpins,
  fetchPublicPrizeSpinWidget,
  goLivePrizeSpin,
  patchPrizeSpinWidget,
  type PatchPrizeSpinWidgetInput,
} from '@/api/prize-spin'
import { type PrizeSpinListParams, prizeSpinKeys } from '@/queries/keys'

export function usePrizeSpins(
  accountId: number | undefined,
  params: PrizeSpinListParams,
) {
  return useQuery({
    queryKey: prizeSpinKeys.list(accountId ?? 0, params),
    queryFn: () => fetchPrizeSpins(accountId!, params),
    enabled: accountId !== undefined,
  })
}

export function usePrizeSpinWidget(
  accountId: number | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: prizeSpinKeys.widget(accountId ?? 0),
    queryFn: () => fetchPrizeSpinWidget(accountId!),
    enabled: accountId !== undefined && enabled,
  })
}

export function useCreatePrizeSpin(accountId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (title: string) => createPrizeSpin(accountId!, title),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: prizeSpinKeys.lists() })
    },
  })
}

export function useGoLivePrizeSpin(accountId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (prizeSpinId: number) => goLivePrizeSpin(accountId!, prizeSpinId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: prizeSpinKeys.lists() })
    },
  })
}

export function useDeactivatePrizeSpin(accountId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (prizeSpinId: number) =>
      deactivatePrizeSpin(accountId!, prizeSpinId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: prizeSpinKeys.lists() })
    },
  })
}

export function useArchivePrizeSpin(accountId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (prizeSpinId: number) => archivePrizeSpin(accountId!, prizeSpinId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: prizeSpinKeys.lists() })
    },
  })
}

const WIDGET_POLL_MS = 5000

export function usePublicPrizeSpinWidget(ucid: string | undefined) {
  return useQuery({
    queryKey: prizeSpinKeys.publicWidget(ucid ?? ''),
    queryFn: () => fetchPublicPrizeSpinWidget(ucid!),
    enabled: ucid !== undefined && ucid.length > 0,
    refetchInterval: WIDGET_POLL_MS,
    retry: false,
  })
}

export function usePatchPrizeSpinWidget(accountId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PatchPrizeSpinWidgetInput) =>
      patchPrizeSpinWidget(accountId!, body),
    onSuccess: (_data, _variables, _context) => {
      if (accountId !== undefined) {
        void queryClient.invalidateQueries({
          queryKey: prizeSpinKeys.widget(accountId),
        })
      }
    },
  })
}
