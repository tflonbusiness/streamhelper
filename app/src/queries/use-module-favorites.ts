import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchModuleFavorites,
  putModuleFavorites,
} from '@/api/module-favorites'
export const moduleFavoritesKeys = {
  all: ['module-favorites'] as const,
  detail: () => [...moduleFavoritesKeys.all, 'detail'] as const,
}

export function useModuleFavorites(enabled = true) {
  return useQuery({
    queryKey: moduleFavoritesKeys.detail(),
    queryFn: fetchModuleFavorites,
    enabled,
  })
}

export function useToggleModuleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      moduleId,
      moduleIds,
      favorite,
    }: {
      moduleId: string
      moduleIds: string[]
      favorite: boolean
    }) => {
      const next = favorite
        ? [...moduleIds, moduleId]
        : moduleIds.filter((id) => id !== moduleId)
      return putModuleFavorites(next)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(moduleFavoritesKeys.detail(), data)
    },
  })
}
