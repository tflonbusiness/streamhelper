import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  archiveChatRoll,
  createChatRoll,
  fetchChatRollWidget,
  fetchChatRolls,
  goLiveChatRoll,
  patchChatRollWidget,
  type PatchChatRollWidgetInput,
} from '@/api/chat-roll'
import { type ChatRollListParams, chatRollKeys } from '@/queries/keys'

export function useChatRolls(
  accountId: number | undefined,
  params: ChatRollListParams,
) {
  return useQuery({
    queryKey: chatRollKeys.list(accountId ?? 0, params),
    queryFn: () => fetchChatRolls(accountId!, params),
    enabled: accountId !== undefined,
    placeholderData: keepPreviousData,
  })
}

export function useChatRollWidget(
  accountId: number | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: chatRollKeys.widget(accountId ?? 0),
    queryFn: () => fetchChatRollWidget(accountId!),
    enabled: accountId !== undefined && enabled,
  })
}

export function useCreateChatRoll(accountId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (title: string) => createChatRoll(accountId!, title),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatRollKeys.lists() })
    },
  })
}

export function useArchiveChatRoll(accountId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (chatRollId: number) => archiveChatRoll(accountId!, chatRollId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatRollKeys.lists() })
    },
  })
}

export function useGoLiveChatRoll(accountId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (chatRollId: number) => goLiveChatRoll(accountId!, chatRollId),
    onSuccess: (_data, chatRollId) => {
      void queryClient.invalidateQueries({ queryKey: chatRollKeys.lists() })
      if (accountId !== undefined) {
        void queryClient.invalidateQueries({
          queryKey: chatRollKeys.session(accountId, chatRollId),
        })
      }
    },
  })
}

export function usePatchChatRollWidget(accountId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PatchChatRollWidgetInput) =>
      patchChatRollWidget(accountId!, body),
    onSuccess: () => {
      if (accountId !== undefined) {
        void queryClient.invalidateQueries({
          queryKey: chatRollKeys.widget(accountId),
        })
      }
    },
  })
}
