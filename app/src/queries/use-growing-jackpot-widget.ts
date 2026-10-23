import { useQuery } from '@tanstack/react-query'
import { fetchPublicGrowingJackpotWidget } from '@/api/growing-jackpot'
import { growingJackpotKeys } from '@/queries/keys'

const PUBLIC_POLL_MS = 2000

export function usePublicGrowingJackpotWidget(accountUcid: string | null) {
  return useQuery({
    queryKey: growingJackpotKeys.publicWidget(accountUcid ?? ''),
    queryFn: () => fetchPublicGrowingJackpotWidget(accountUcid!),
    enabled: accountUcid !== null,
    refetchInterval: PUBLIC_POLL_MS,
  })
}
