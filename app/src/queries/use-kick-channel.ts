import { useQuery } from '@tanstack/react-query'
import {
  fetchKickChannel,
  KickChannelNotFoundError,
} from '@/api/kick-channel'
import { kickChannelKeys } from '@/queries/keys'

export function useKickChannel(accountId: number | undefined) {
  return useQuery({
    queryKey: kickChannelKeys.detail(accountId ?? 0),
    queryFn: () => fetchKickChannel(accountId!),
    enabled: accountId !== undefined,
    retry: (failureCount, error) => {
      if (error instanceof KickChannelNotFoundError) {
        return false
      }
      return failureCount < 1
    },
  })
}
