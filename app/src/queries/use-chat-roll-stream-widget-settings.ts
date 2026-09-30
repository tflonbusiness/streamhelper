import { useMutation, useQueryClient } from '@tanstack/react-query'
import { patchChatRoll, type PatchChatRollInput } from '@/api/chat-roll'
import { chatRollKeys } from '@/queries/keys'

export function usePatchChatRollStreamWidgetSettings(accountId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { chatRollId: number; body: PatchChatRollInput }) =>
      patchChatRoll(accountId, input.chatRollId, input.body),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: chatRollKeys.lists() })
      void queryClient.invalidateQueries({
        queryKey: chatRollKeys.session(accountId, variables.chatRollId),
      })
      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === chatRollKeys.all[0] &&
          query.queryKey[1] === 'publicWidget',
      })
    },
  })
}
