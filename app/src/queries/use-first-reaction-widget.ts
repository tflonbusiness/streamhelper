import { useQuery } from '@tanstack/react-query'
import { fetchPublicFirstReactionWidget } from '@/api/first-reaction'
import { firstReactionKeys } from '@/queries/keys'

const PUBLIC_POLL_MS = 400

export function usePublicFirstReactionWidget(accountUcid: string | null) {
  return useQuery({
    queryKey: firstReactionKeys.publicWidget(accountUcid ?? ''),
    queryFn: () => fetchPublicFirstReactionWidget(accountUcid!),
    enabled: accountUcid !== null,
    refetchInterval: (query) => {
      const data = query.state.data
      if (data?.status === 'active' && data.phase === 'accepting') {
        return 250
      }
      return PUBLIC_POLL_MS
    },
  })
}
