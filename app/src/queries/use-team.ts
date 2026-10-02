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
import { authKeys, type AccountMembersListParams } from '@/queries/keys'

export type AccountMembersQueryData = {
  members: AccountMember[]
  total: number
  page: number
  limit: number
  envelope?: EntitlementEnvelope
}

export function useAccountMembers(
  accountId: number | undefined,
  params: AccountMembersListParams,
) {
  return useQuery({
    queryKey: authKeys.members(accountId ?? 0, params),
    queryFn: async (): Promise<AccountMembersQueryData> => {
      const result = await fetchAccountMembers(accountId!, params)
      const { data, envelope } = pickEntitlementEnvelope(result)
      return {
        members: data.members,
        total: data.total,
        page: data.page,
        limit: data.limit,
        envelope,
      }
    },
    enabled: accountId !== undefined,
    placeholderData: (previous) => previous,
  })
}

export function useCreateModerator(accountId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => createModerator(accountId!, name),
    onSuccess: () => {
      if (accountId !== undefined) {
        void queryClient.invalidateQueries({
          queryKey: authKeys.membersRoot(accountId),
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
          queryKey: authKeys.membersRoot(accountId),
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
