import i18n from '@/i18n/init-i18n'
import type { EntitlementEnvelope } from '@/lib/entitlements'
import type {
  ChatRollRoleId,
  ChatRollRoleSetting,
  WeightCombineMode,
} from '@/lib/chat-roll'

const jsonHeaders = {
  'Content-Type': 'application/json',
}

export type ChatRollArchivedFilter = 'false' | 'true' | 'all'

export type ChatRollStatus = 'live' | 'off_air' | 'archived'

export type ChatRollRoleSettings = Record<ChatRollRoleId, ChatRollRoleSetting>

export type ChatRollRecord = {
  id: number
  accountId: number
  title: string
  status: ChatRollStatus
  keyword: string
  widgetKeywordPrefix: string
  combineMode: WeightCombineMode
  excludeWinnerAfterRoll: boolean
  isAcceptingParticipants: boolean
  replyInChat: boolean
  winnerResponseEnabled: boolean
  winnerResponseSeconds: number
  showWinnerResponseInReveal: boolean
  roleSettings: ChatRollRoleSettings
  createdAt: string
  createdByUserId: number
  createdByName: string
}

export type ChatRollListResult = {
  records: ChatRollRecord[]
  total: number
  page: number
  limit: number
} & Partial<EntitlementEnvelope>

export type ChatRollRecordResponse = ChatRollRecord & Partial<EntitlementEnvelope>

export type ChatRollParticipant = {
  id: number
  chatRollId: number
  provider: 'kick' | 'twitch' | 'youtube' | null
  providerUserId: string | null
  displayName: string
  roleIds: ChatRollRoleId[]
  joinedAt: string
}

export type ChatRollWinResponseStatus =
  | 'pending'
  | 'confirmed'
  | 'no_response'
  | 'not_required'

export type ChatRollWin = {
  id: number
  chatRollId: number
  participantId: number
  displayName: string
  coefficientAtPick: string
  rolledByName: string
  rollIndex: number
  responseStatus: ChatRollWinResponseStatus
  responseDeadlineAt: string | null
  respondedAt: string | null
  createdAt: string
  winnerResponseMessage: string | null
}

export type ChatRollWidget = {
  id: number
  accountId: number
  width: number
  height: number
  createdAt: string
  updatedAt: string
}

export type PatchChatRollInput = {
  title?: string
  keyword?: string
  widget_keyword_prefix?: string
  combine_mode?: WeightCombineMode
  exclude_winner_after_roll?: boolean
  is_accepting_participants?: boolean
  reply_in_chat?: boolean
  winner_response_enabled?: boolean
  winner_response_seconds?: number
  show_winner_response_in_reveal?: boolean
  role_settings?: ChatRollRoleSettings
}

export type PatchChatRollWidgetInput = {
  width?: number
  height?: number
}

export function isChatRollArchived(
  record: Pick<ChatRollRecord, 'status'>,
): boolean {
  return record.status === 'archived'
}

export function isChatRollReadOnly(
  record: Pick<ChatRollRecord, 'status'>,
): boolean {
  return record.status === 'archived'
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json()
    if (data && typeof data.message === 'string') {
      return data.message
    }
    if (data && Array.isArray(data.message)) {
      return data.message.join(', ')
    }
  } catch {
    // ignore
  }
  return fallback
}

export async function fetchChatRoll(
  accountId: number,
  chatRollId: number,
): Promise<ChatRollRecordResponse> {
  const response = await fetch(
    `/accounts/${accountId}/chat-rolls/${chatRollId}`,
    { credentials: 'include' },
  )

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, i18n.t('errors.api.loadChatRoll')))
  }

  return response.json() as Promise<ChatRollRecordResponse>
}

export async function fetchChatRolls(
  accountId: number,
  options?: {
    archived?: ChatRollArchivedFilter
    page?: number
    limit?: number
  },
): Promise<ChatRollListResult> {
  const params = new URLSearchParams()
  if (options?.archived) {
    params.set('archived', options.archived)
  }
  if (options?.page !== undefined) {
    params.set('page', String(options.page))
  }
  if (options?.limit !== undefined) {
    params.set('limit', String(options.limit))
  }

  const query = params.toString()
  const response = await fetch(
    `/accounts/${accountId}/chat-rolls${query ? `?${query}` : ''}`,
    { credentials: 'include' },
  )

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, i18n.t('errors.api.loadChatRolls')))
  }

  return response.json() as Promise<ChatRollListResult>
}

export async function createChatRoll(
  accountId: number,
  title: string,
): Promise<ChatRollRecord> {
  const response = await fetch(`/accounts/${accountId}/chat-rolls`, {
    method: 'POST',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify({ title }),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, i18n.t('errors.api.createChatRoll')))
  }

  return response.json() as Promise<ChatRollRecord>
}

export async function patchChatRoll(
  accountId: number,
  chatRollId: number,
  body: PatchChatRollInput,
): Promise<ChatRollRecord> {
  const response = await fetch(
    `/accounts/${accountId}/chat-rolls/${chatRollId}`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: jsonHeaders,
      body: JSON.stringify(body),
    },
  )

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, i18n.t('errors.api.updateChatRoll')))
  }

  return response.json() as Promise<ChatRollRecord>
}

export async function goLiveChatRoll(
  accountId: number,
  chatRollId: number,
): Promise<ChatRollRecord> {
  const response = await fetch(
    `/accounts/${accountId}/chat-rolls/${chatRollId}/go-live`,
    {
      method: 'POST',
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.goLiveChatRoll')),
    )
  }

  return response.json() as Promise<ChatRollRecord>
}

export async function deactivateChatRoll(
  accountId: number,
  chatRollId: number,
): Promise<ChatRollRecord> {
  const response = await fetch(
    `/accounts/${accountId}/chat-rolls/${chatRollId}/deactivate`,
    {
      method: 'POST',
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.deactivateChatRoll')),
    )
  }

  return response.json() as Promise<ChatRollRecord>
}

export async function archiveChatRoll(
  accountId: number,
  chatRollId: number,
): Promise<void> {
  const response = await fetch(
    `/accounts/${accountId}/chat-rolls/${chatRollId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, i18n.t('errors.api.archiveSession')))
  }
}

export async function fetchChatRollParticipants(
  accountId: number,
  chatRollId: number,
): Promise<ChatRollParticipant[]> {
  const response = await fetch(
    `/accounts/${accountId}/chat-rolls/${chatRollId}/participants`,
    { credentials: 'include' },
  )

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, i18n.t('errors.api.loadParticipants')))
  }

  const data = (await response.json()) as { participants: ChatRollParticipant[] }
  return data.participants
}

export async function deleteChatRollParticipant(
  accountId: number,
  chatRollId: number,
  participantId: number,
): Promise<void> {
  const response = await fetch(
    `/accounts/${accountId}/chat-rolls/${chatRollId}/participants/${participantId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, i18n.t('errors.api.removeParticipant')))
  }
}

export async function deleteAllChatRollParticipants(
  accountId: number,
  chatRollId: number,
): Promise<void> {
  const response = await fetch(
    `/accounts/${accountId}/chat-rolls/${chatRollId}/participants`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, i18n.t('errors.api.clearParticipants')))
  }
}

export async function fetchChatRollWins(
  accountId: number,
  chatRollId: number,
): Promise<ChatRollWin[]> {
  const response = await fetch(
    `/accounts/${accountId}/chat-rolls/${chatRollId}/wins`,
    { credentials: 'include' },
  )

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, i18n.t('errors.api.loadWinners')))
  }

  const data = (await response.json()) as { wins: ChatRollWin[] }
  return data.wins
}

export async function deleteChatRollWin(
  accountId: number,
  chatRollId: number,
  winId: number,
): Promise<void> {
  const response = await fetch(
    `/accounts/${accountId}/chat-rolls/${chatRollId}/wins/${winId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, i18n.t('errors.api.removeWinner')))
  }
}

export async function deleteAllChatRollWins(
  accountId: number,
  chatRollId: number,
): Promise<void> {
  const response = await fetch(
    `/accounts/${accountId}/chat-rolls/${chatRollId}/wins`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, i18n.t('errors.api.clearWinners')))
  }
}

export async function rollChatRoll(
  accountId: number,
  chatRollId: number,
): Promise<ChatRollWin> {
  const response = await fetch(
    `/accounts/${accountId}/chat-rolls/${chatRollId}/roll`,
    {
      method: 'POST',
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, i18n.t('errors.api.roll')))
  }

  return response.json() as Promise<ChatRollWin>
}

export async function fetchChatRollWidget(
  accountId: number,
): Promise<ChatRollWidget> {
  const response = await fetch(`/accounts/${accountId}/chat-roll-widget`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, i18n.t('errors.api.loadWidgetSettings')))
  }

  return response.json() as Promise<ChatRollWidget>
}

export async function patchChatRollWidget(
  accountId: number,
  body: PatchChatRollWidgetInput,
): Promise<ChatRollWidget> {
  const response = await fetch(`/accounts/${accountId}/chat-roll-widget`, {
    method: 'PATCH',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, i18n.t('errors.api.saveChatRollWidgetSettings')))
  }

  return response.json() as Promise<ChatRollWidget>
}

export type ChatRollPublicWidgetUnavailableReason =
  | 'no_live_session'
  | 'no_sessions'
  | 'subscription_expired'
  | 'entitlement_over_limit'

export type ChatRollPublicWidgetActiveRecord = {
  id: number
  keyword: string
  widgetKeywordPrefix: string
  status: 'live'
}

export type ChatRollPublicWidgetResponse =
  | { status: 'unavailable'; reason: ChatRollPublicWidgetUnavailableReason }
  | { status: 'active'; record: ChatRollPublicWidgetActiveRecord }

export class ChatRollWidgetNotFoundError extends Error {
  constructor() {
    super(i18n.t('errors.sessionNotFound'))
    this.name = 'ChatRollWidgetNotFoundError'
  }
}

export async function fetchPublicChatRollWidget(
  accountUcid: string,
): Promise<ChatRollPublicWidgetResponse> {
  const response = await fetch(`/chat-rolls/widget/${accountUcid}`)

  if (response.status === 404) {
    throw new ChatRollWidgetNotFoundError()
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, i18n.t('errors.api.loadWidget')))
  }

  return response.json() as Promise<ChatRollPublicWidgetResponse>
}
