import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchPublicMediaInteractiveWidget,
  fetchMediaInteractiveBurnedPoints,
  fetchMediaInteractiveQueue,
  fetchKickChannelRewards,
  fetchMediaInteractiveSettings,
  patchMediaInteractiveSettings,
  pauseMediaInteractive,
  removeMediaInteractiveItem,
  reorderMediaInteractive,
  skipMediaInteractive,
  staffEnqueueYoutube,
} from '@/api/media-interactive'

const POLL_MS = 3000

export const mediaInteractiveKeys = {
  all: ['media-interactive'] as const,
  settings: (accountId: number) =>
    [...mediaInteractiveKeys.all, 'settings', accountId] as const,
  kickRewards: (accountId: number) =>
    [...mediaInteractiveKeys.all, 'kick-rewards', accountId] as const,
  queue: (accountId: number, list: 'queue' | 'backup') =>
    [...mediaInteractiveKeys.all, 'queue', accountId, list] as const,
  burned: (accountId: number) =>
    [...mediaInteractiveKeys.all, 'burned', accountId] as const,
  publicWidget: (ucid: string) =>
    [...mediaInteractiveKeys.all, 'public', ucid] as const,
}

export function useMediaInteractiveSettings(accountId: number | undefined) {
  return useQuery({
    queryKey: mediaInteractiveKeys.settings(accountId ?? 0),
    queryFn: () => fetchMediaInteractiveSettings(accountId!),
    enabled: accountId !== undefined,
  })
}

export function useKickChannelRewards(accountId: number | undefined, enabled: boolean) {
  return useQuery({
    queryKey: mediaInteractiveKeys.kickRewards(accountId ?? 0),
    queryFn: () => fetchKickChannelRewards(accountId!),
    enabled: accountId !== undefined && enabled,
    staleTime: 60_000,
  })
}

export function useMediaInteractiveQueue(
  accountId: number | undefined,
  listKind: 'queue' | 'backup',
) {
  return useQuery({
    queryKey: mediaInteractiveKeys.queue(accountId ?? 0, listKind),
    queryFn: () => fetchMediaInteractiveQueue(accountId!, listKind),
    enabled: accountId !== undefined,
    refetchInterval: POLL_MS,
  })
}

export function useMediaInteractiveBurned(accountId: number | undefined) {
  return useQuery({
    queryKey: mediaInteractiveKeys.burned(accountId ?? 0),
    queryFn: () => fetchMediaInteractiveBurnedPoints(accountId!),
    enabled: accountId !== undefined,
    refetchInterval: POLL_MS,
  })
}

export function usePublicMediaInteractiveWidget(accountUcid: string | null) {
  return useQuery({
    queryKey: mediaInteractiveKeys.publicWidget(accountUcid ?? ''),
    queryFn: () => fetchPublicMediaInteractiveWidget(accountUcid!),
    enabled: Boolean(accountUcid),
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: true,
    staleTime: 0,
  })
}

export function useMediaInteractiveMutations(accountId: number) {
  const qc = useQueryClient()
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: mediaInteractiveKeys.all })
  }

  return {
    patchSettings: useMutation({
      mutationFn: patchMediaInteractiveSettings.bind(null, accountId),
      onSuccess: invalidate,
    }),
    staffEnqueue: useMutation({
      mutationFn: ({
        url,
        listKind,
      }: {
        url: string
        listKind: 'queue' | 'backup'
      }) => staffEnqueueYoutube(accountId, url, listKind),
      onSuccess: invalidate,
    }),
    reorder: useMutation({
      mutationFn: ({
        listKind,
        orderedIds,
      }: {
        listKind: 'queue' | 'backup'
        orderedIds: number[]
      }) => reorderMediaInteractive(accountId, listKind, orderedIds),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (itemId: number) => removeMediaInteractiveItem(accountId, itemId),
      onSuccess: invalidate,
    }),
    pause: useMutation({
      mutationFn: (paused: boolean) => pauseMediaInteractive(accountId, paused),
      onSuccess: invalidate,
    }),
    skip: useMutation({
      mutationFn: () => skipMediaInteractive(accountId),
      onSuccess: invalidate,
    }),
  }
}
