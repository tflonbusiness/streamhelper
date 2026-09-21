import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  archiveBonusBuySlot,
  BonusBuySessionArchivedError,
  createBonusBuy,
  createBonusBuySlot,
  upsertBonusBuyWidgetCustomPreset,
  endBonusBuy,
  fetchBonusBuy,
  fetchBonusBuySlots,
  fetchBonusBuys,
  fetchBonusBuyWidget,
  fetchBonusBuyWidgetPresets,
  fetchPublicBonusBuyWidget,
  patchBonusBuy,
  patchBonusBuySlot,
  patchBonusBuyWidget,
  type PatchBonusBuyInput,
  type PatchBonusBuySlotInput,
  type PatchBonusBuyWidgetInput,
  type UpsertBonusBuyWidgetCustomPresetInput,
} from '@/api/bonus-buy'
import { bonusBuyKeys, type BonusBuyListParams } from '@/queries/keys'

const WIDGET_POLL_MS = 5000

export type BonusBuySessionData = {
  record: Awaited<ReturnType<typeof fetchBonusBuy>>
  slots: Awaited<ReturnType<typeof fetchBonusBuySlots>>
}

async function fetchBonusBuySession(
  accountId: number,
  bonusBuyId: number,
): Promise<BonusBuySessionData> {
  const [record, slots] = await Promise.all([
    fetchBonusBuy(accountId, bonusBuyId),
    fetchBonusBuySlots(accountId, bonusBuyId),
  ])
  return { record, slots }
}

function sessionQueryKey(accountId: number, bonusBuyId: number) {
  return bonusBuyKeys.session(accountId, bonusBuyId)
}

export function useBonusBuys(
  accountId: number | undefined,
  params: BonusBuyListParams,
) {
  return useQuery({
    queryKey: bonusBuyKeys.list(accountId ?? 0, params),
    queryFn: () => fetchBonusBuys(accountId!, params),
    enabled: accountId !== undefined,
    placeholderData: keepPreviousData,
  })
}

export function useCreateBonusBuy(accountId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { name: string; startBalance: string }) =>
      createBonusBuy(accountId!, input.name, input.startBalance),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bonusBuyKeys.lists() })
    },
  })
}

export function useBonusBuySession(
  accountId: number | undefined,
  bonusBuyId: number | null,
) {
  return useQuery({
    queryKey: sessionQueryKey(accountId ?? 0, bonusBuyId ?? 0),
    queryFn: () => fetchBonusBuySession(accountId!, bonusBuyId!),
    enabled: accountId !== undefined && bonusBuyId !== null,
  })
}

export function useBonusBuyWidget(
  accountId: number | undefined,
  bonusBuyId: number | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: bonusBuyKeys.widget(accountId ?? 0, bonusBuyId ?? 0),
    queryFn: () => fetchBonusBuyWidget(accountId!, bonusBuyId!),
    enabled: accountId !== undefined && bonusBuyId !== null && enabled,
  })
}

export function useBonusBuyWidgetPresets(accountId: number | undefined) {
  return useQuery({
    queryKey: bonusBuyKeys.presets(accountId ?? 0),
    queryFn: () => fetchBonusBuyWidgetPresets(accountId!),
    enabled: accountId !== undefined,
  })
}

export function usePublicBonusBuyWidget(bonusBuyId: number | null) {
  return useQuery({
    queryKey: bonusBuyKeys.publicWidget(bonusBuyId ?? 0),
    queryFn: () => fetchPublicBonusBuyWidget(bonusBuyId!),
    enabled: bonusBuyId !== null,
    refetchInterval: (query) =>
      query.state.error instanceof BonusBuySessionArchivedError
        ? false
        : WIDGET_POLL_MS,
    retry: (failureCount, error) =>
      error instanceof BonusBuySessionArchivedError ? false : failureCount < 3,
  })
}

function useInvalidateBonusBuySession(accountId: number | undefined) {
  const queryClient = useQueryClient()

  return (bonusBuyId: number) => {
    if (accountId === undefined) {
      return
    }
    void queryClient.invalidateQueries({
      queryKey: sessionQueryKey(accountId, bonusBuyId),
    })
  }
}

export function useCreateBonusBuySlot(
  accountId: number | undefined,
  bonusBuyId: number | null,
) {
  const invalidateSession = useInvalidateBonusBuySession(accountId)

  return useMutation({
    mutationFn: (input: {
      name: string
      purchaseAmount: string
      providerName?: string
    }) =>
      createBonusBuySlot(
        accountId!,
        bonusBuyId!,
        input.name,
        input.purchaseAmount,
        input.providerName,
      ),
    onSuccess: () => {
      if (bonusBuyId !== null) {
        invalidateSession(bonusBuyId)
      }
    },
  })
}

export function usePatchBonusBuy(
  accountId: number | undefined,
  bonusBuyId: number | null,
) {
  const invalidateSession = useInvalidateBonusBuySession(accountId)

  return useMutation({
    mutationFn: (body: PatchBonusBuyInput) =>
      patchBonusBuy(accountId!, bonusBuyId!, body),
    onSuccess: () => {
      if (bonusBuyId !== null) {
        invalidateSession(bonusBuyId)
      }
    },
  })
}

export function usePatchBonusBuySlot(
  accountId: number | undefined,
  bonusBuyId: number | null,
) {
  const invalidateSession = useInvalidateBonusBuySession(accountId)

  return useMutation({
    mutationFn: (input: { slotId: number; body: PatchBonusBuySlotInput }) =>
      patchBonusBuySlot(accountId!, bonusBuyId!, input.slotId, input.body),
    onSuccess: () => {
      if (bonusBuyId !== null) {
        invalidateSession(bonusBuyId)
      }
    },
  })
}

export function useArchiveBonusBuySlot(
  accountId: number | undefined,
  bonusBuyId: number | null,
) {
  const invalidateSession = useInvalidateBonusBuySession(accountId)

  return useMutation({
    mutationFn: (slotId: number) =>
      archiveBonusBuySlot(accountId!, bonusBuyId!, slotId),
    onSuccess: () => {
      if (bonusBuyId !== null) {
        invalidateSession(bonusBuyId)
      }
    },
  })
}

export function useEndBonusBuy(
  accountId: number | undefined,
  bonusBuyId: number | null,
) {
  const queryClient = useQueryClient()
  const invalidateSession = useInvalidateBonusBuySession(accountId)

  return useMutation({
    mutationFn: () => endBonusBuy(accountId!, bonusBuyId!),
    onSuccess: () => {
      if (bonusBuyId !== null) {
        invalidateSession(bonusBuyId)
      }
      void queryClient.invalidateQueries({ queryKey: bonusBuyKeys.lists() })
    },
  })
}

export function usePatchBonusBuyWidget(
  accountId: number | undefined,
  bonusBuyId: number | null,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PatchBonusBuyWidgetInput) =>
      patchBonusBuyWidget(accountId!, bonusBuyId!, body),
    onSuccess: () => {
      if (accountId !== undefined && bonusBuyId !== null) {
        void queryClient.invalidateQueries({
          queryKey: bonusBuyKeys.widget(accountId, bonusBuyId),
        })
      }
    },
  })
}

export function useUpsertBonusBuyWidgetCustomPreset(
  accountId: number | undefined,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpsertBonusBuyWidgetCustomPresetInput) =>
      upsertBonusBuyWidgetCustomPreset(accountId!, body),
    onSuccess: () => {
      if (accountId !== undefined) {
        void queryClient.invalidateQueries({
          queryKey: bonusBuyKeys.presets(accountId),
        })
      }
    },
  })
}
