import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createModerator,
  fetchAccountMembers,
  fetchModeratorInviteLink,
  revokeModerator,
  type AccountMember,
} from '@/api/auth'
import {
  pickEntitlementEnvelope,
  type EntitlementEnvelope,
} from '@/lib/entitlements'
import { authKeys } from '@/queries/keys'

export type AccountMembersQueryData = {
  members: AccountMember[]
  envelope?: EntitlementEnvelope
}

export function useAccountMembers(accountId: number | undefined) {
  return useQuery({
    queryKey: authKeys.members(accountId ?? 0),
    queryFn: async (): Promise<AccountMembersQueryData> => {
      const result = await fetchAccountMembers(accountId!)
      const { data, envelope } = pickEntitlementEnvelope(result)
      return { members: data.members, envelope }
    },
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
