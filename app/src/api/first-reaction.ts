import { readApiErrorMessage as readErrorMessage } from '@/api/read-api-error-message'
import i18n from '@/i18n/init-i18n'

const jsonHeaders = {
  'Content-Type': 'application/json',
}

export type FirstReactionArchivedFilter = 'false' | 'true' | 'all'
export type FirstReactionStatus = 'live' | 'off_air' | 'archived'

export type FirstReactionSettings = {
  wordSource: 'manual' | 'generated'
  manualScope: 'per_draw' | 'per_session'
  sessionKeyword: string | null
  generationPool: 'builtin_casino' | 'builtin_general' | 'custom_list'
  customWords: string[]
  avoidRepeatUntilPoolExhausted: boolean
  acceptTimeoutEnabled: boolean
  acceptTimeoutSeconds: number
  onTimeout: 'close_no_winner'
  preAcceptDelayMs: number
  startCooldownEnabled: boolean
  startCooldownSeconds: number
  autoSeriesEnabled: boolean
  autoSeriesLength: number
  announceWinnerInChat: boolean
  winnerOverlaySeconds: number
  roleSettings: Record<string, { enabled: boolean; weight?: number }>
}

export type FirstReactionRecord = {
  id: number
  accountId: number
  title: string
  status: FirstReactionStatus
  settings: FirstReactionSettings
  nextStartAllowedAt: string | null
  createdAt: string
  createdByUserId: number
  createdByName: string
}

export type FirstReactionDrawSortField =
  | 'drawIndex'
  | 'keyword'
  | 'outcome'
  | 'winner'
  | 'time'

export type FirstReactionDrawSortOrder = 'asc' | 'desc'

export type FirstReactionDrawListParams = {
  page: number
  limit: number
  sortBy: FirstReactionDrawSortField
  sortOrder: FirstReactionDrawSortOrder
}

export type FirstReactionDrawListResult = {
  draws: FirstReactionDraw[]
  total: number
  page: number
  limit: number
  sortBy: FirstReactionDrawSortField
  sortOrder: FirstReactionDrawSortOrder
}

export type FirstReactionDraw = {
  id: number
  firstReactionId: number
  drawIndex: number
  keyword: string
  keywordSource: 'manual' | 'generated'
  phase: 'preview' | 'accepting' | 'closed'
  result: string | null
  previewStartedAt: string
  acceptingStartedAt: string | null
  acceptDeadlineAt: string | null
  closedAt: string | null
  winnerProvider: string | null
  winnerProviderUserId: string | null
  winnerDisplayName: string | null
  proofToken: string | null
  fulfillmentStatus: string
  startedByUserId: number
  createdAt: string
}

export type FirstReactionSessionResponse = {
  record: FirstReactionRecord
  activeDraw: FirstReactionDraw | null
}

export type FirstReactionListResult = {
  records: FirstReactionRecord[]
  total: number
  page: number
  limit: number
}

export type FirstReactionWidgetStyle = {
  boltFillStart: string
  boltFillEnd: string
  boltStroke: string
  boltGlow: string
  textHint: string
  textKeyword: string
  textTimer: string
}

export type FirstReactionWidgetPresetSource = 'system' | 'user'

export type FirstReactionWidgetStylePreset = {
  id: number
  accountId: number | null
  createdByUserId: number | null
  source: FirstReactionWidgetPresetSource
  name: string
  styleSettings: FirstReactionWidgetStyle
  createdAt: string
  updatedAt: string
}

export type FirstReactionWidget = {
  id: number
  accountId: number
  width: number
  height: number
  presetId: number
  style: FirstReactionWidgetStyle
  createdAt: string
  updatedAt: string
}

export type PublicFirstReactionWidgetActiveView = {
  status: 'active'
  width: number
  height: number
  style: FirstReactionWidgetStyle
  phase: 'idle' | 'preview' | 'accepting' | 'closed'
  keyword: string | null
  acceptingStartedAt: string | null
  acceptDeadlineAt: string | null
  winner: FirstReactionDraw | null
}

export type PublicFirstReactionWidgetView =
  | PublicFirstReactionWidgetActiveView
  | { status: 'unavailable'; reason: string }

export class FirstReactionWidgetNotFoundError extends Error {
  constructor() {
    super('not_found')
    this.name = 'FirstReactionWidgetNotFoundError'
  }
}

export function isFirstReactionReadOnly(
  record: Pick<FirstReactionRecord, 'status'>,
): boolean {
  return record.status === 'archived'
}

export async function fetchFirstReactions(
  accountId: number,
  params: { archived: FirstReactionArchivedFilter; page: number; limit: number },
): Promise<FirstReactionListResult> {
  const search = new URLSearchParams({
    archived: params.archived,
    page: String(params.page),
    limit: String(params.limit),
  })
  const response = await fetch(
    `/accounts/${accountId}/first-reactions?${search}`,
    { credentials: 'include' },
  )
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to load sessions'))
  }
  return response.json() as Promise<FirstReactionListResult>
}

export async function fetchFirstReactionSession(
  accountId: number,
  firstReactionId: number,
): Promise<FirstReactionSessionResponse> {
  const response = await fetch(
    `/accounts/${accountId}/first-reactions/${firstReactionId}`,
    { credentials: 'include' },
  )
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to load session'))
  }
  return response.json() as Promise<FirstReactionSessionResponse>
}

export async function createFirstReaction(
  accountId: number,
  title: string,
): Promise<FirstReactionSessionResponse> {
  const response = await fetch(`/accounts/${accountId}/first-reactions`, {
    method: 'POST',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify({ title }),
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to create session'))
  }
  return response.json() as Promise<FirstReactionSessionResponse>
}

export async function patchFirstReaction(
  accountId: number,
  firstReactionId: number,
  body: { title?: string; settings?: Partial<FirstReactionSettings> },
): Promise<FirstReactionSessionResponse> {
  const response = await fetch(
    `/accounts/${accountId}/first-reactions/${firstReactionId}`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: jsonHeaders,
      body: JSON.stringify(body),
    },
  )
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to update session'))
  }
  return response.json() as Promise<FirstReactionSessionResponse>
}

export async function archiveFirstReaction(
  accountId: number,
  firstReactionId: number,
): Promise<void> {
  const response = await fetch(
    `/accounts/${accountId}/first-reactions/${firstReactionId}`,
    { method: 'DELETE', credentials: 'include' },
  )
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to archive session'))
  }
}

export async function goLiveFirstReaction(
  accountId: number,
  firstReactionId: number,
): Promise<FirstReactionSessionResponse> {
  const response = await fetch(
    `/accounts/${accountId}/first-reactions/${firstReactionId}/go-live`,
    { method: 'POST', credentials: 'include' },
  )
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to go live'))
  }
  return response.json() as Promise<FirstReactionSessionResponse>
}

export async function deactivateFirstReaction(
  accountId: number,
  firstReactionId: number,
): Promise<FirstReactionSessionResponse> {
  const response = await fetch(
    `/accounts/${accountId}/first-reactions/${firstReactionId}/deactivate`,
    { method: 'POST', credentials: 'include' },
  )
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to deactivate'))
  }
  return response.json() as Promise<FirstReactionSessionResponse>
}

export async function fetchFirstReactionDraws(
  accountId: number,
  firstReactionId: number,
  params: FirstReactionDrawListParams,
): Promise<FirstReactionDrawListResult> {
  const search = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  })
  const response = await fetch(
    `/accounts/${accountId}/first-reactions/${firstReactionId}/draws?${search}`,
    { credentials: 'include' },
  )
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to load draws'))
  }
  return response.json() as Promise<FirstReactionDrawListResult>
}

export async function startFirstReactionDraw(
  accountId: number,
  firstReactionId: number,
  body: { keyword?: string },
): Promise<{ draw: FirstReactionDraw }> {
  const response = await fetch(
    `/accounts/${accountId}/first-reactions/${firstReactionId}/draws/start`,
    {
      method: 'POST',
      credentials: 'include',
      headers: jsonHeaders,
      body: JSON.stringify(body),
    },
  )
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to start draw'))
  }
  return response.json() as Promise<{ draw: FirstReactionDraw }>
}

export async function stopFirstReactionDraw(
  accountId: number,
  firstReactionId: number,
  drawId: number,
): Promise<{ draw: FirstReactionDraw }> {
  const response = await fetch(
    `/accounts/${accountId}/first-reactions/${firstReactionId}/draws/${drawId}/stop`,
    { method: 'POST', credentials: 'include' },
  )
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to stop draw'))
  }
  return response.json() as Promise<{ draw: FirstReactionDraw }>
}

export async function archiveFirstReactionDraw(
  accountId: number,
  firstReactionId: number,
  drawId: number,
): Promise<void> {
  const response = await fetch(
    `/accounts/${accountId}/first-reactions/${firstReactionId}/draws/${drawId}`,
    { method: 'DELETE', credentials: 'include' },
  )
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('firstReaction.couldNotRemoveDraw')),
    )
  }
}

export async function archiveAllFirstReactionDraws(
  accountId: number,
  firstReactionId: number,
): Promise<void> {
  const response = await fetch(
    `/accounts/${accountId}/first-reactions/${firstReactionId}/draws`,
    { method: 'DELETE', credentials: 'include' },
  )
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        i18n.t('firstReaction.couldNotArchiveDraws'),
      ),
    )
  }
}

export async function patchFirstReactionWidget(
  accountId: number,
  body: {
    width?: number
    height?: number
    preset_id?: number
  },
): Promise<FirstReactionWidget> {
  const response = await fetch(`/accounts/${accountId}/first-reaction-widget`, {
    method: 'PATCH',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to save widget'))
  }
  return response.json() as Promise<FirstReactionWidget>
}

export async function fetchFirstReactionWidget(
  accountId: number,
): Promise<FirstReactionWidget> {
  const response = await fetch(`/accounts/${accountId}/first-reaction-widget`, {
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to load widget'))
  }
  return response.json() as Promise<FirstReactionWidget>
}

export async function fetchFirstReactionWidgetPresets(
  accountId: number,
): Promise<FirstReactionWidgetStylePreset[]> {
  const response = await fetch(
    `/accounts/${accountId}/first-reaction-widget-presets`,
    { credentials: 'include' },
  )
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to load widget presets'))
  }
  return response.json() as Promise<FirstReactionWidgetStylePreset[]>
}

export async function upsertFirstReactionWidgetCustomPreset(
  accountId: number,
  body: { style_settings: FirstReactionWidgetStyle },
): Promise<FirstReactionWidgetStylePreset> {
  const response = await fetch(
    `/accounts/${accountId}/first-reaction-widget-presets/custom`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: jsonHeaders,
      body: JSON.stringify(body),
    },
  )
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to save widget preset'))
  }
  return response.json() as Promise<FirstReactionWidgetStylePreset>
}

export async function fetchPublicFirstReactionWidget(
  accountUcid: string,
): Promise<PublicFirstReactionWidgetView> {
  const response = await fetch(`/first-reactions/widget/${accountUcid}`)
  if (response.status === 404) {
    throw new FirstReactionWidgetNotFoundError()
  }
  if (!response.ok) {
    throw new Error('Failed to load widget')
  }
  return response.json() as Promise<PublicFirstReactionWidgetView>
}
