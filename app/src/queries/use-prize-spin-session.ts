import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  archivePrizeSpin,
  createPrizeSpinSector,
  deactivatePrizeSpin,
  deleteAllPrizeSpinWins,
  deletePrizeSpinSector,
  deletePrizeSpinWin,
  distributePrizeSpinSectorsEqually,
  fetchPrizeSpin,
  fetchPrizeSpinSectors,
  fetchPrizeSpinWins,
  goLivePrizeSpin,
  spinPrizeSpin,
  updatePrizeSpinSector,
  type PatchPrizeSpinSectorInput,
} from '@/api/prize-spin'
import { prizeSpinKeys } from '@/queries/keys'

export type PrizeSpinSessionData = {
  record: Awaited<ReturnType<typeof fetchPrizeSpin>>
  sectors: Awaited<ReturnType<typeof fetchPrizeSpinSectors>>
  wins: Awaited<ReturnType<typeof fetchPrizeSpinWins>>
}

function sessionQueryKey(accountId: number, prizeSpinId: number) {
  return prizeSpinKeys.session(accountId, prizeSpinId)
}

async function fetchPrizeSpinSession(
  accountId: number,
  prizeSpinId: number,
): Promise<PrizeSpinSessionData> {
  const [record, sectors, wins] = await Promise.all([
    fetchPrizeSpin(accountId, prizeSpinId),
    fetchPrizeSpinSectors(accountId, prizeSpinId),
    fetchPrizeSpinWins(accountId, prizeSpinId),
  ])
  return { record, sectors, wins }
}

export function usePrizeSpinSession(
  accountId: number | undefined,
  prizeSpinId: number,
) {
  return useQuery({
    queryKey: sessionQueryKey(accountId ?? 0, prizeSpinId),
    queryFn: () => fetchPrizeSpinSession(accountId!, prizeSpinId),
    enabled: accountId !== undefined && Number.isFinite(prizeSpinId),
  })
}

function useInvalidatePrizeSpinSession(accountId: number | undefined) {
  const queryClient = useQueryClient()

  return (prizeSpinId: number) => {
    if (accountId === undefined) {
      return
    }
    void queryClient.invalidateQueries({
      queryKey: sessionQueryKey(accountId, prizeSpinId),
    })
  }
}

function useInvalidatePrizeSpinLists() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: prizeSpinKeys.lists() })
  }
}

export function useSpinPrizeSpin(
  accountId: number | undefined,
  prizeSpinId: number,
) {
  const invalidateSession = useInvalidatePrizeSpinSession(accountId)

  return useMutation({
    mutationFn: (participantNick: string) =>
      spinPrizeSpin(accountId!, prizeSpinId, participantNick),
    onSuccess: () => invalidateSession(prizeSpinId),
  })
}

export function useCreatePrizeSpinSector(
  accountId: number | undefined,
  prizeSpinId: number,
) {
  const invalidateSession = useInvalidatePrizeSpinSession(accountId)

  return useMutation({
    mutationFn: (input: {
      label: string
      winPercent: string
      color: string
    }) =>
      createPrizeSpinSector(
        accountId!,
        prizeSpinId,
        input.label,
        input.winPercent,
        input.color,
      ),
    onSuccess: () => invalidateSession(prizeSpinId),
  })
}

export function useUpdatePrizeSpinSector(
  accountId: number | undefined,
  prizeSpinId: number,
) {
  const invalidateSession = useInvalidatePrizeSpinSession(accountId)

  return useMutation({
    mutationFn: (input: { sectorId: number; body: PatchPrizeSpinSectorInput }) =>
      updatePrizeSpinSector(
        accountId!,
        prizeSpinId,
        input.sectorId,
        input.body,
      ),
    onSuccess: () => invalidateSession(prizeSpinId),
  })
}

export function useDeletePrizeSpinSector(
  accountId: number | undefined,
  prizeSpinId: number,
) {
  const invalidateSession = useInvalidatePrizeSpinSession(accountId)

  return useMutation({
    mutationFn: (sectorId: number) =>
      deletePrizeSpinSector(accountId!, prizeSpinId, sectorId),
    onSuccess: () => invalidateSession(prizeSpinId),
  })
}

export function useDistributePrizeSpinSectors(
  accountId: number | undefined,
  prizeSpinId: number,
) {
  const invalidateSession = useInvalidatePrizeSpinSession(accountId)

  return useMutation({
    mutationFn: () =>
      distributePrizeSpinSectorsEqually(accountId!, prizeSpinId),
    onSuccess: () => invalidateSession(prizeSpinId),
  })
}

export function useDeletePrizeSpinWin(
  accountId: number | undefined,
  prizeSpinId: number,
) {
  const invalidateSession = useInvalidatePrizeSpinSession(accountId)

  return useMutation({
    mutationFn: (winId: number) =>
      deletePrizeSpinWin(accountId!, prizeSpinId, winId),
    onSuccess: () => invalidateSession(prizeSpinId),
  })
}

export function useDeleteAllPrizeSpinWins(
  accountId: number | undefined,
  prizeSpinId: number,
) {
  const invalidateSession = useInvalidatePrizeSpinSession(accountId)

  return useMutation({
    mutationFn: () => deleteAllPrizeSpinWins(accountId!, prizeSpinId),
    onSuccess: () => invalidateSession(prizeSpinId),
  })
}

export function useGoLivePrizeSpinSession(
  accountId: number | undefined,
  prizeSpinId: number,
) {
  const invalidateSession = useInvalidatePrizeSpinSession(accountId)
  const invalidateLists = useInvalidatePrizeSpinLists()

  return useMutation({
    mutationFn: () => goLivePrizeSpin(accountId!, prizeSpinId),
    onSuccess: () => {
      invalidateSession(prizeSpinId)
      invalidateLists()
    },
  })
}

export function useDeactivatePrizeSpinSession(
  accountId: number | undefined,
  prizeSpinId: number,
) {
  const invalidateSession = useInvalidatePrizeSpinSession(accountId)
  const invalidateLists = useInvalidatePrizeSpinLists()

  return useMutation({
    mutationFn: () => deactivatePrizeSpin(accountId!, prizeSpinId),
    onSuccess: () => {
      invalidateSession(prizeSpinId)
      invalidateLists()
    },
  })
}

export function useArchivePrizeSpinSession(
  accountId: number | undefined,
  prizeSpinId: number,
) {
  const invalidateSession = useInvalidatePrizeSpinSession(accountId)
  const invalidateLists = useInvalidatePrizeSpinLists()

  return useMutation({
    mutationFn: () => archivePrizeSpin(accountId!, prizeSpinId),
    onSuccess: () => {
      invalidateSession(prizeSpinId)
      invalidateLists()
    },
  })
}
