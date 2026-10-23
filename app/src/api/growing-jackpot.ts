import { readApiErrorMessage as readErrorMessage } from '@/api/read-api-error-message'
import i18n from '@/i18n/init-i18n'

const jsonHeaders = {
  'Content-Type': 'application/json',
}

export type GrowingJackpotStatus = 'live' | 'off_air' | 'archived'

export type GrowingJackpotArchivedFilter = 'false' | 'true' | 'all'

export type GrowingJackpotSettings = {
  joinKeyword: string
  timerSeconds: number
  prizeBase: number
  prizeStepPerJoin: number
  prizeDisplayCap: number | null
  weightCombineMode: 'highest' | 'sum'
  announceWinnerInChat: boolean
  winnerOverlaySeconds: number
  roleSettings: Record<string, { enabled: boolean; weight?: number }>
}

export type GrowingJackpotRecord = {
  id: number
  accountId: number
  title: string
  status: GrowingJackpotStatus
  settings: GrowingJackpotSettings
  createdAt: string
  createdByUserId: number
  createdByName: string
}

export type GrowingJackpotRound = {
  id: number
  growingJackpotId: number
  roundIndex: number
  joinKeyword: string
  phase: 'accepting' | 'drawing' | 'closed'
  result: string | null
  endsAt: string
  participantCount: number
  displayPrize: number
  closedAt: string | null
  winnerProvider: string | null
  winnerProviderUserId: string | null
  winnerDisplayName: string | null
  proofToken: string | null
  fulfillmentStatus: string
  startedByUserId: number
  createdAt: string
}

export type GrowingJackpotSessionResponse = {
  session: GrowingJackpotRecord
  activeRound: GrowingJackpotRound | null
}

export type GrowingJackpotListResult = {
  sessions: GrowingJackpotRecord[]
  total: number
  page: number
  limit: number
}

export type GrowingJackpotRoundSortField =
  | 'roundIndex'
  | 'keyword'
  | 'outcome'
  | 'winner'
  | 'time'

export type GrowingJackpotRoundSortOrder = 'asc' | 'desc'

export type GrowingJackpotRoundListParams = {
  page: number
  limit: number
  sortBy: GrowingJackpotRoundSortField
  sortOrder: GrowingJackpotRoundSortOrder
}

export type GrowingJackpotRoundListResult = {
  rounds: GrowingJackpotRound[]
  total: number
  page: number
  limit: number
  sortBy: GrowingJackpotRoundSortField
  sortOrder: GrowingJackpotRoundSortOrder
}

export type GrowingJackpotWidgetStyle = {
  prizeText: string
  prizeTextDim: string
  keywordText: string
  timerText: string
}

export type GrowingJackpotWidgetSettings = {
  width: number
  height: number
  style: GrowingJackpotWidgetStyle
}

export type PublicGrowingJackpotWidget =
  | { status: 'unavailable'; reason: 'subscription_expired' }
  | {
      status: 'idle'
      growingJackpotId?: number
      width: number
      height: number
      style: GrowingJackpotWidgetStyle
    }
  | {
      status: 'accepting'
      round: GrowingJackpotRound
      joinKeyword: string
      settings: {
        winnerOverlaySeconds: number
        prizeDisplayCap: number | null
      }
      width: number
      height: number
      style: GrowingJackpotWidgetStyle
    }
  | {
      status: 'winner'
      round: GrowingJackpotRound
      settings: {
        winnerOverlaySeconds: number
        prizeDisplayCap: number | null
      }
      width: number
      height: number
      style: GrowingJackpotWidgetStyle
    }
  | {
      status: 'no_participants'
      round: GrowingJackpotRound
      settings: {
        winnerOverlaySeconds: number
        prizeDisplayCap: number | null
      }
      width: number
      height: number
      style: GrowingJackpotWidgetStyle
    }

export function isGrowingJackpotReadOnly(record: GrowingJackpotRecord): boolean {
  return record.status === 'archived'
}

async function parseJson<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, fallbackMessage))
  }
  return (await response.json()) as T
}

export async function fetchGrowingJackpots(
  accountId: number,
  params: {
    archived: GrowingJackpotArchivedFilter
    page: number
    limit: number
  },
): Promise<GrowingJackpotListResult> {
  const search = new URLSearchParams({
    archived: params.archived,
    page: String(params.page),
    limit: String(params.limit),
  })
  const response = await fetch(
    `/accounts/${accountId}/growing-jackpots?${search}`,
    { credentials: 'include' },
  )
  return parseJson(response, 'Failed to load Growing Jackpot sessions')
}

export async function fetchGrowingJackpotSession(
  accountId: number,
  growingJackpotId: number,
): Promise<GrowingJackpotSessionResponse> {
  const response = await fetch(
    `/accounts/${accountId}/growing-jackpots/${growingJackpotId}`,
    { credentials: 'include' },
  )
  return parseJson(response, 'Failed to load Growing Jackpot session')
}

export async function createGrowingJackpot(
  accountId: number,
  title: string,
): Promise<GrowingJackpotSessionResponse> {
  const response = await fetch(`/accounts/${accountId}/growing-jackpots`, {
    method: 'POST',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify({ title }),
  })
  return parseJson(response, 'Failed to create Growing Jackpot session')
}

export async function patchGrowingJackpotSession(
  accountId: number,
  growingJackpotId: number,
  body: { title?: string; settings?: Partial<GrowingJackpotSettings> },
): Promise<GrowingJackpotSessionResponse> {
  const response = await fetch(
    `/accounts/${accountId}/growing-jackpots/${growingJackpotId}`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: jsonHeaders,
      body: JSON.stringify(body),
    },
  )
  return parseJson(response, 'Failed to update Growing Jackpot session')
}

export async function archiveGrowingJackpot(
  accountId: number,
  growingJackpotId: number,
): Promise<void> {
  const response = await fetch(
    `/accounts/${accountId}/growing-jackpots/${growingJackpotId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  )
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to archive session'))
  }
}

export async function goLiveGrowingJackpot(
  accountId: number,
  growingJackpotId: number,
): Promise<GrowingJackpotSessionResponse> {
  const response = await fetch(
    `/accounts/${accountId}/growing-jackpots/${growingJackpotId}/go-live`,
    {
      method: 'POST',
      credentials: 'include',
      headers: jsonHeaders,
    },
  )
  return parseJson(response, 'Failed to go live')
}

export async function deactivateGrowingJackpot(
  accountId: number,
  growingJackpotId: number,
): Promise<GrowingJackpotSessionResponse> {
  const response = await fetch(
    `/accounts/${accountId}/growing-jackpots/${growingJackpotId}/deactivate`,
    {
      method: 'POST',
      credentials: 'include',
      headers: jsonHeaders,
    },
  )
  return parseJson(response, 'Failed to deactivate session')
}

export async function fetchGrowingJackpotRounds(
  accountId: number,
  growingJackpotId: number,
  params: GrowingJackpotRoundListParams,
): Promise<GrowingJackpotRoundListResult> {
  const search = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  })
  const response = await fetch(
    `/accounts/${accountId}/growing-jackpots/${growingJackpotId}/rounds?${search}`,
    { credentials: 'include' },
  )
  return parseJson(response, 'Failed to load rounds')
}

export async function startGrowingJackpotRound(
  accountId: number,
  growingJackpotId: number,
): Promise<{ round: GrowingJackpotRound }> {
  const response = await fetch(
    `/accounts/${accountId}/growing-jackpots/${growingJackpotId}/rounds/start`,
    {
      method: 'POST',
      credentials: 'include',
      headers: jsonHeaders,
    },
  )
  return parseJson(response, 'Failed to start round')
}

export async function stopGrowingJackpotRound(
  accountId: number,
  growingJackpotId: number,
  roundId: number,
): Promise<{ round: GrowingJackpotRound }> {
  const response = await fetch(
    `/accounts/${accountId}/growing-jackpots/${growingJackpotId}/rounds/${roundId}/stop`,
    {
      method: 'POST',
      credentials: 'include',
      headers: jsonHeaders,
    },
  )
  return parseJson(response, 'Failed to stop round')
}

export async function archiveGrowingJackpotRound(
  accountId: number,
  growingJackpotId: number,
  roundId: number,
): Promise<void> {
  const response = await fetch(
    `/accounts/${accountId}/growing-jackpots/${growingJackpotId}/rounds/${roundId}`,
    { method: 'DELETE', credentials: 'include' },
  )
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('growingJackpot.couldNotRemoveRound')),
    )
  }
}

export async function archiveAllGrowingJackpotRounds(
  accountId: number,
  growingJackpotId: number,
): Promise<void> {
  const response = await fetch(
    `/accounts/${accountId}/growing-jackpots/${growingJackpotId}/rounds`,
    { method: 'DELETE', credentials: 'include' },
  )
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        i18n.t('growingJackpot.couldNotArchiveRounds'),
      ),
    )
  }
}

export class GrowingJackpotWidgetNotFoundError extends Error {
  constructor() {
    super(i18n.t('growingJackpot.widgetAccountNotFound'))
    this.name = 'GrowingJackpotWidgetNotFoundError'
  }
}

export async function fetchGrowingJackpotWidget(
  accountId: number,
): Promise<GrowingJackpotWidgetSettings> {
  const response = await fetch(`/accounts/${accountId}/growing-jackpot-widget`, {
    credentials: 'include',
  })
  return parseJson(response, 'Failed to load widget settings')
}

export async function patchGrowingJackpotWidget(
  accountId: number,
  body: {
    width?: number
    height?: number
    style?: Partial<GrowingJackpotWidgetStyle>
  },
): Promise<GrowingJackpotWidgetSettings> {
  const response = await fetch(`/accounts/${accountId}/growing-jackpot-widget`, {
    method: 'PATCH',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  })
  return parseJson(response, 'Failed to update widget settings')
}

export async function fetchPublicGrowingJackpotWidget(
  accountUcid: string,
): Promise<PublicGrowingJackpotWidget> {
  const response = await fetch(`/growing-jackpots/widget/${accountUcid}`)
  if (response.status === 404) {
    throw new GrowingJackpotWidgetNotFoundError()
  }
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to load widget'))
  }
  return (await response.json()) as PublicGrowingJackpotWidget
}
