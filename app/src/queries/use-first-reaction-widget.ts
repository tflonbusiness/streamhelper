import { useQuery } from '@tanstack/react-query'
import { fetchPublicFirstReactionWidget } from '@/api/first-reaction'
import { isFirstReactionWidgetOverlayVisible } from '@/lib/first-reaction-widget-view'
import { firstReactionKeys } from '@/queries/keys'

const PUBLIC_POLL_MS = 400

export function usePublicFirstReactionWidget(accountUcid: string | null) {
  return useQuery({
    queryKey: firstReactionKeys.publicWidget(accountUcid ?? ''),
    queryFn: () => fetchPublicFirstReactionWidget(accountUcid!),
    enabled: accountUcid !== null,
    refetchInterval: (query) => {
      const data = query.state.data
      if (data?.status === 'active' && isFirstReactionWidgetOverlayVisible(data)) {
        return 250
      }
      return PUBLIC_POLL_MS
    },
  })
}
