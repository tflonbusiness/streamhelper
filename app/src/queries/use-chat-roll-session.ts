import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  archiveChatRoll,
  deleteAllChatRollParticipants,
  deleteAllChatRollWins,
  deleteChatRollParticipant,
  deleteChatRollWin,
  fetchChatRoll,
  fetchChatRollParticipants,
  fetchChatRollWins,
  patchChatRoll,
  rollChatRoll,
  type PatchChatRollInput,
} from '@/api/chat-roll'
import { chatRollKeys } from '@/queries/keys'

const LIVE_SESSION_POLL_MS = 5000

export type ChatRollSessionData = {
  record: Awaited<ReturnType<typeof fetchChatRoll>>
  participants: Awaited<ReturnType<typeof fetchChatRollParticipants>>
  wins: Awaited<ReturnType<typeof fetchChatRollWins>>
}

function sessionQueryKey(accountId: number, chatRollId: number) {
  return chatRollKeys.session(accountId, chatRollId)
}

async function fetchChatRollSession(
  accountId: number,
  chatRollId: number,
): Promise<ChatRollSessionData> {
  const [record, participants, wins] = await Promise.all([
    fetchChatRoll(accountId, chatRollId),
    fetchChatRollParticipants(accountId, chatRollId),
    fetchChatRollWins(accountId, chatRollId),
  ])
  return { record, participants, wins }
}

export function useChatRollSession(
  accountId: number | undefined,
  chatRollId: number,
) {
  return useQuery({
    queryKey: sessionQueryKey(accountId ?? 0, chatRollId),
    queryFn: () => fetchChatRollSession(accountId!, chatRollId),
    enabled: accountId !== undefined && Number.isFinite(chatRollId),
    refetchInterval: (query) =>
      query.state.data?.record.status === 'live' ? LIVE_SESSION_POLL_MS : false,
  })
}

function useInvalidateChatRollSession(accountId: number | undefined) {
  const queryClient = useQueryClient()

  return (chatRollId: number) => {
    if (accountId === undefined) {
      return
    }
    void queryClient.invalidateQueries({
      queryKey: sessionQueryKey(accountId, chatRollId),
    })
  }
}

function useInvalidateChatRollLists() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: chatRollKeys.lists() })
  }
}

export function usePatchChatRollSession(
  accountId: number | undefined,
  chatRollId: number,
) {
  const invalidateSession = useInvalidateChatRollSession(accountId)

  return useMutation({
    mutationFn: (body: PatchChatRollInput) =>
      patchChatRoll(accountId!, chatRollId, body),
    onSuccess: () => invalidateSession(chatRollId),
  })
}

export function useRollChatRoll(
  accountId: number | undefined,
  chatRollId: number,
) {
  const invalidateSession = useInvalidateChatRollSession(accountId)

  return useMutation({
    mutationFn: () => rollChatRoll(accountId!, chatRollId),
    onSuccess: () => invalidateSession(chatRollId),
  })
}

export function useDeleteChatRollParticipant(
  accountId: number | undefined,
  chatRollId: number,
) {
  const invalidateSession = useInvalidateChatRollSession(accountId)

  return useMutation({
    mutationFn: (participantId: number) =>
      deleteChatRollParticipant(accountId!, chatRollId, participantId),
    onSuccess: () => invalidateSession(chatRollId),
  })
}

export function useDeleteAllChatRollParticipants(
  accountId: number | undefined,
  chatRollId: number,
) {
  const invalidateSession = useInvalidateChatRollSession(accountId)

  return useMutation({
    mutationFn: () => deleteAllChatRollParticipants(accountId!, chatRollId),
    onSuccess: () => invalidateSession(chatRollId),
  })
}

export function useDeleteChatRollWin(
  accountId: number | undefined,
  chatRollId: number,
) {
  const invalidateSession = useInvalidateChatRollSession(accountId)

  return useMutation({
    mutationFn: (winId: number) =>
      deleteChatRollWin(accountId!, chatRollId, winId),
    onSuccess: () => invalidateSession(chatRollId),
  })
}

export function useDeleteAllChatRollWins(
  accountId: number | undefined,
  chatRollId: number,
) {
  const invalidateSession = useInvalidateChatRollSession(accountId)

  return useMutation({
    mutationFn: () => deleteAllChatRollWins(accountId!, chatRollId),
    onSuccess: () => invalidateSession(chatRollId),
  })
}

export function useArchiveChatRollSession(
  accountId: number | undefined,
  chatRollId: number,
) {
  const invalidateSession = useInvalidateChatRollSession(accountId)
  const invalidateLists = useInvalidateChatRollLists()

  return useMutation({
    mutationFn: () => archiveChatRoll(accountId!, chatRollId),
    onSuccess: () => {
      invalidateSession(chatRollId)
      invalidateLists()
    },
  })
}
