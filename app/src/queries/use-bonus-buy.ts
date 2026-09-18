import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  archiveBonusBuySlot,
  createBonusBuy,
  createBonusBuySlot,
  endBonusBuy,
  fetchBonusBuy,
  fetchBonusBuySlots,
  fetchBonusBuys,
  fetchBonusBuyWidget,
  fetchPublicBonusBuyWidget,
  patchBonusBuy,
  patchBonusBuySlot,
  patchBonusBuyWidget,
  type PatchBonusBuyInput,
  type PatchBonusBuySlotInput,
  type PatchBonusBuyWidgetInput,
} from '@/api/bonus-buy'
import { bonusBuyKeys } from '@/queries/keys'

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

export function useBonusBuys(accountId: number | undefined) {
  return useQuery({
    queryKey: bonusBuyKeys.list(accountId ?? 0),
    queryFn: () => fetchBonusBuys(accountId!),
    enabled: accountId !== undefined,
  })
}

export function useCreateBonusBuy(accountId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { title: string; startBalance: string }) =>
      createBonusBuy(accountId!, input.title, input.startBalance),
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
  enabled: boolean,
) {
  return useQuery({
    queryKey: bonusBuyKeys.widget(accountId ?? 0),
    queryFn: () => fetchBonusBuyWidget(accountId!),
    enabled: accountId !== undefined && enabled,
  })
}

export function usePublicBonusBuyWidget(bonusBuyId: number | null) {
  return useQuery({
    queryKey: bonusBuyKeys.publicWidget(bonusBuyId ?? 0),
    queryFn: () => fetchPublicBonusBuyWidget(bonusBuyId!),
    enabled: bonusBuyId !== null,
    refetchInterval: WIDGET_POLL_MS,
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
      slotName: string
      purchaseAmount: string
      nickProvider?: string
    }) =>
      createBonusBuySlot(
        accountId!,
        bonusBuyId!,
        input.slotName,
        input.purchaseAmount,
        input.nickProvider,
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

export function usePatchBonusBuyWidget(accountId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PatchBonusBuyWidgetInput) =>
      patchBonusBuyWidget(accountId!, body),
    onSuccess: () => {
      if (accountId !== undefined) {
        void queryClient.invalidateQueries({
          queryKey: bonusBuyKeys.widget(accountId),
        })
      }
    },
  })
}
