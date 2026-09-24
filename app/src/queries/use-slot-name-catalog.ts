import { useQuery } from '@tanstack/react-query'
import { fetchSlotNameCatalog } from '@/api/slot-name-catalog'
import { buildSlotNameIndex, type SlotNameIndex } from '@/lib/slot-name-search'

export const slotNameCatalogKeys = {
  all: ['slotNameCatalog'] as const,
  list: () => [...slotNameCatalogKeys.all, 'list'] as const,
}

export function useSlotNameCatalog() {
  return useQuery({
    queryKey: slotNameCatalogKeys.list(),
    queryFn: fetchSlotNameCatalog,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  })
}

export function useSlotNameIndex(): {
  index: SlotNameIndex | null
  isLoading: boolean
  isError: boolean
} {
  const query = useSlotNameCatalog()
  const index =
    query.data === undefined ? null : buildSlotNameIndex(query.data)

  return {
    index,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
