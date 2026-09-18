import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createModerator,
  fetchAccountMembers,
  fetchModeratorInviteLink,
  revokeModerator,
} from '@/api/auth'
import { authKeys } from '@/queries/keys'

export function useAccountMembers(accountId: number | undefined) {
  return useQuery({
    queryKey: authKeys.members(accountId ?? 0),
    queryFn: () => fetchAccountMembers(accountId!),
    enabled: accountId !== undefined,
  })
}

export function useCreateModerator(accountId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => createModerator(accountId!, name),
    onSuccess: () => {
      if (accountId !== undefined) {
        void queryClient.invalidateQueries({
          queryKey: authKeys.members(accountId),
        })
      }
    },
  })
}

export function useRevokeModerator(accountId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => revokeModerator(accountId!, userId),
    onSuccess: () => {
      if (accountId !== undefined) {
        void queryClient.invalidateQueries({
          queryKey: authKeys.members(accountId),
        })
      }
    },
  })
}

export function useModeratorInviteLink(accountId: number | undefined) {
  return useMutation({
    mutationFn: (userId: number) =>
      fetchModeratorInviteLink(accountId!, userId),
  })
}
