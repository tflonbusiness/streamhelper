const jsonHeaders = {
  'Content-Type': 'application/json',
}

export type PrizeSpinArchivedFilter = 'false' | 'true' | 'all'

export type PrizeSpinListResult = {
  records: PrizeSpinRecord[]
  total: number
  page: number
  limit: number
}

export type PrizeSpinRecord = {
  id: number
  accountId: number
  title: string
  isActive: boolean
  isArchived: boolean
  createdAt: string
  createdByUserId: number
  createdByName: string
}

export type PrizeSpinSector = {
  id: number
  prizeSpinId: number
  label: string
  winPercent: string
  color: string | null
  sortOrder: number
  createdAt: string
}

export type PrizeSpinWin = {
  id: number
  prizeSpinId: number
  sectorId: number
  sectorLabel: string
  participantNick: string
  spunByName: string
  createdAt: string
}

export type PatchPrizeSpinSectorInput = {
  label?: string
  win_percent?: string
  color?: string | null
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

export async function fetchPrizeSpin(
  accountId: number,
  prizeSpinId: number,
): Promise<PrizeSpinRecord> {
  const response = await fetch(
    `/accounts/${accountId}/prize-spins/${prizeSpinId}`,
    {
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not load prize spin'),
    )
  }

  return response.json() as Promise<PrizeSpinRecord>
}

export async function fetchPrizeSpins(
  accountId: number,
  options?: {
    archived?: PrizeSpinArchivedFilter
    page?: number
    limit?: number
  },
): Promise<PrizeSpinListResult> {
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
    `/accounts/${accountId}/prize-spins${query ? `?${query}` : ''}`,
    {
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not load prize spin history'),
    )
  }

  return response.json() as Promise<PrizeSpinListResult>
}

export async function createPrizeSpin(
  accountId: number,
  title: string,
): Promise<PrizeSpinRecord> {
  const response = await fetch(`/accounts/${accountId}/prize-spins`, {
    method: 'POST',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify({ title }),
  })

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not create prize spin'),
    )
  }

  return response.json() as Promise<PrizeSpinRecord>
}

export async function goLivePrizeSpin(
  accountId: number,
  prizeSpinId: number,
): Promise<PrizeSpinRecord> {
  const response = await fetch(
    `/accounts/${accountId}/prize-spins/${prizeSpinId}/go-live`,
    {
      method: 'POST',
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not go live'),
    )
  }

  return response.json() as Promise<PrizeSpinRecord>
}

export async function deactivatePrizeSpin(
  accountId: number,
  prizeSpinId: number,
): Promise<PrizeSpinRecord> {
  const response = await fetch(
    `/accounts/${accountId}/prize-spins/${prizeSpinId}/deactivate`,
    {
      method: 'POST',
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not deactivate session'),
    )
  }

  return response.json() as Promise<PrizeSpinRecord>
}

export async function archivePrizeSpin(
  accountId: number,
  prizeSpinId: number,
): Promise<void> {
  const response = await fetch(
    `/accounts/${accountId}/prize-spins/${prizeSpinId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not archive session'),
    )
  }
}

export async function fetchPrizeSpinSectors(
  accountId: number,
  prizeSpinId: number,
): Promise<PrizeSpinSector[]> {
  const response = await fetch(
    `/accounts/${accountId}/prize-spins/${prizeSpinId}/sectors`,
    { credentials: 'include' },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not load wheel sectors'),
    )
  }

  const data = (await response.json()) as { sectors: PrizeSpinSector[] }
  return data.sectors
}

export async function createPrizeSpinSector(
  accountId: number,
  prizeSpinId: number,
  label: string,
  winPercent: string,
  color?: string,
): Promise<PrizeSpinSector> {
  const response = await fetch(
    `/accounts/${accountId}/prize-spins/${prizeSpinId}/sectors`,
    {
      method: 'POST',
      credentials: 'include',
      headers: jsonHeaders,
      body: JSON.stringify({
        label,
        win_percent: winPercent,
        color,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not add sector'),
    )
  }

  return response.json() as Promise<PrizeSpinSector>
}

export async function updatePrizeSpinSector(
  accountId: number,
  prizeSpinId: number,
  sectorId: number,
  body: PatchPrizeSpinSectorInput,
): Promise<PrizeSpinSector> {
  const response = await fetch(
    `/accounts/${accountId}/prize-spins/${prizeSpinId}/sectors/${sectorId}`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: jsonHeaders,
      body: JSON.stringify(body),
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not update sector'),
    )
  }

  return response.json() as Promise<PrizeSpinSector>
}

export async function distributePrizeSpinSectorsEqually(
  accountId: number,
  prizeSpinId: number,
): Promise<PrizeSpinSector[]> {
  const response = await fetch(
    `/accounts/${accountId}/prize-spins/${prizeSpinId}/sectors/distribute-equally`,
    {
      method: 'POST',
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not distribute sector weights'),
    )
  }

  const data = (await response.json()) as { sectors: PrizeSpinSector[] }
  return data.sectors
}

export async function deletePrizeSpinSector(
  accountId: number,
  prizeSpinId: number,
  sectorId: number,
): Promise<void> {
  const response = await fetch(
    `/accounts/${accountId}/prize-spins/${prizeSpinId}/sectors/${sectorId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not delete sector'),
    )
  }
}

export async function fetchPrizeSpinWins(
  accountId: number,
  prizeSpinId: number,
): Promise<PrizeSpinWin[]> {
  const response = await fetch(
    `/accounts/${accountId}/prize-spins/${prizeSpinId}/wins`,
    { credentials: 'include' },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not load winners'),
    )
  }

  const data = (await response.json()) as { wins: PrizeSpinWin[] }
  return data.wins
}

export async function deletePrizeSpinWin(
  accountId: number,
  prizeSpinId: number,
  winId: number,
): Promise<void> {
  const response = await fetch(
    `/accounts/${accountId}/prize-spins/${prizeSpinId}/wins/${winId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not remove winner'),
    )
  }
}

export async function deleteAllPrizeSpinWins(
  accountId: number,
  prizeSpinId: number,
): Promise<void> {
  const response = await fetch(
    `/accounts/${accountId}/prize-spins/${prizeSpinId}/wins`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not archive winners'),
    )
  }
}

export type PrizeSpinWidgetSettings = {
  id: number
  accountId: number
  width: number
  height: number
  createdAt: string
  updatedAt: string
}

export type PrizeSpinWidgetLatestWin = {
  id: number
  sectorId: number
  sectorLabel: string
  participantNick: string
  createdAt: string
}

export type PrizeSpinWidgetView = {
  record: {
    id: number
    title: string
    isActive: boolean
  }
  sectors: PrizeSpinSector[]
  latestWin: PrizeSpinWidgetLatestWin | null
  settings: {
    width: number
    height: number
  }
}

export type PatchPrizeSpinWidgetInput = {
  width?: number
  height?: number
}

export async function fetchPrizeSpinWidget(
  accountId: number,
): Promise<PrizeSpinWidgetSettings> {
  const response = await fetch(`/accounts/${accountId}/prize-spin-widget`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not load widget settings'),
    )
  }

  return response.json() as Promise<PrizeSpinWidgetSettings>
}

export async function patchPrizeSpinWidget(
  accountId: number,
  body: PatchPrizeSpinWidgetInput,
): Promise<PrizeSpinWidgetSettings> {
  const response = await fetch(`/accounts/${accountId}/prize-spin-widget`, {
    method: 'PATCH',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not update widget settings'),
    )
  }

  return response.json() as Promise<PrizeSpinWidgetSettings>
}

export class PrizeSpinWidgetNotFoundError extends Error {
  constructor() {
    super('Session not found.')
    this.name = 'PrizeSpinWidgetNotFoundError'
  }
}

export class PrizeSpinWidgetNotLiveError extends Error {
  constructor() {
    super('No live session.')
    this.name = 'PrizeSpinWidgetNotLiveError'
  }
}

export async function fetchPublicPrizeSpinWidget(
  ucid: string,
): Promise<PrizeSpinWidgetView> {
  const response = await fetch(
    `/prize-spins/widget/${encodeURIComponent(ucid)}`,
  )

  if (response.status === 404) {
    throw new PrizeSpinWidgetNotFoundError()
  }

  if (response.status === 409) {
    throw new PrizeSpinWidgetNotLiveError()
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not load widget'),
    )
  }

  return response.json() as Promise<PrizeSpinWidgetView>
}

export async function spinPrizeSpin(
  accountId: number,
  prizeSpinId: number,
  participantNick: string,
): Promise<PrizeSpinWin> {
  const response = await fetch(
    `/accounts/${accountId}/prize-spins/${prizeSpinId}/spin`,
    {
      method: 'POST',
      credentials: 'include',
      headers: jsonHeaders,
      body: JSON.stringify({ participant_nick: participantNick }),
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not spin prize wheel'),
    )
  }

  return response.json() as Promise<PrizeSpinWin>
}
