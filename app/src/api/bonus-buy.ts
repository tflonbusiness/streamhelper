import i18n from '@/i18n/init-i18n'
const jsonHeaders = {
  'Content-Type': 'application/json',
}

export type BonusBuyArchivedFilter = 'false' | 'true' | 'all'

export type BonusBuyStatus = 'active' | 'archived'

export type BonusBuySlotStatus = 'pending' | 'playing' | 'archived'

export type BonusBuyWidgetPresetSource = 'system' | 'user'

export type BonusBuyWidgetStyleSettings = {
  backgroundColor: string
  surfaceColor: string
  borderColor: string
  accentColor: string
  positiveColor: string
  negativeColor: string
  liveColor: string
  textMutedColor: string
  borderRadius: number
  padding: number
  fontFamily: string
}

export type BonusBuyListResult = {
  records: BonusBuyRecord[]
  total: number
  page: number
  limit: number
}

export type BonusBuyRecord = {
  id: number
  accountId: number
  name: string
  startBalance: string
  currencyCode: string
  status: BonusBuyStatus
  createdAt: string
  createdByUserId: number
  createdByName: string
}

export type BonusBuySlot = {
  id: number
  bonusBuyId: number
  createdByUserId: number
  createdByName: string
  name: string
  providerName: string | null
  purchaseAmount: string
  winAmount: string | null
  multiplier: string | null
  status: BonusBuySlotStatus
  createdAt: string
}

export type PatchBonusBuyInput = {
  name?: string
  start_balance?: string
  currency_code?: string
}

export type PatchBonusBuySlotInput = {
  name?: string
  provider_name?: string | null
  purchase_amount?: string
  win_amount?: string | null
  status?: BonusBuySlotStatus
}

export type BonusBuyWidgetSettings = {
  id: number
  bonusBuyId: number
  presetId: number
  width: number
  height: number
  styleSettings: BonusBuyWidgetStyleSettings
  backgroundColor: string
  surfaceColor: string
  borderColor: string
  accentColor: string
  positiveColor: string
  negativeColor: string
  liveColor: string
  textMutedColor: string
  borderRadius: number
  padding: number
  fontFamily: string
  createdAt: string
  updatedAt: string
}

export type BonusBuyWidgetStylePreset = {
  id: number
  accountId: number | null
  createdByUserId: number | null
  source: BonusBuyWidgetPresetSource
  name: string
  styleSettings: BonusBuyWidgetStyleSettings
  createdAt: string
  updatedAt: string
}

export type PatchBonusBuyWidgetInput = {
  width?: number
  height?: number
  preset_id?: number
}

export type UpsertBonusBuyWidgetCustomPresetInput = {
  style_settings: BonusBuyWidgetStyleSettings
}

export type PublicBonusBuyRecord = {
  id: number
  name: string
  startBalance: string
  currencyCode: string
  status: BonusBuyStatus
}

export type BonusBuyWidgetView = {
  record: PublicBonusBuyRecord
  slots: BonusBuySlot[]
  settings: BonusBuyWidgetSettings
}

export class BonusBuySessionArchivedError extends Error {
  constructor() {
    super('SESSION_ARCHIVED')
    this.name = 'BonusBuySessionArchivedError'
  }
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

export async function fetchBonusBuy(
  accountId: number,
  bonusBuyId: number,
): Promise<BonusBuyRecord> {
  const response = await fetch(
    `/accounts/${accountId}/bonus-buys/${bonusBuyId}`,
    {
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.loadBonusBuy')),
    )
  }

  return response.json() as Promise<BonusBuyRecord>
}

export async function fetchBonusBuys(
  accountId: number,
  options?: {
    archived?: BonusBuyArchivedFilter
    page?: number
    limit?: number
  },
): Promise<BonusBuyListResult> {
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
    `/accounts/${accountId}/bonus-buys${query ? `?${query}` : ''}`,
    {
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.loadBonusBuyHistory')),
    )
  }

  return response.json() as Promise<BonusBuyListResult>
}

export async function createBonusBuy(
  accountId: number,
  name: string,
  startBalance: string,
  currencyCode: string,
): Promise<BonusBuyRecord> {
  const response = await fetch(`/accounts/${accountId}/bonus-buys`, {
    method: 'POST',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify({
      name,
      start_balance: startBalance,
      currency_code: currencyCode,
    }),
  })

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.createBonusBuy')),
    )
  }

  return response.json() as Promise<BonusBuyRecord>
}

export async function patchBonusBuy(
  accountId: number,
  bonusBuyId: number,
  body: PatchBonusBuyInput,
): Promise<BonusBuyRecord> {
  const response = await fetch(
    `/accounts/${accountId}/bonus-buys/${bonusBuyId}`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: jsonHeaders,
      body: JSON.stringify(body),
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.updateBonusBuySession')),
    )
  }

  return response.json() as Promise<BonusBuyRecord>
}

export async function archiveBonusBuy(
  accountId: number,
  bonusBuyId: number,
): Promise<BonusBuyRecord> {
  const response = await fetch(
    `/accounts/${accountId}/bonus-buys/${bonusBuyId}/end`,
    {
      method: 'POST',
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.archiveBonusBuySession')),
    )
  }

  return response.json() as Promise<BonusBuyRecord>
}

export async function fetchBonusBuySlots(
  accountId: number,
  bonusBuyId: number,
): Promise<BonusBuySlot[]> {
  const response = await fetch(
    `/accounts/${accountId}/bonus-buys/${bonusBuyId}/slots`,
    { credentials: 'include' },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.loadBonusBuySlots')),
    )
  }

  return response.json() as Promise<BonusBuySlot[]>
}

export async function createBonusBuySlot(
  accountId: number,
  bonusBuyId: number,
  name: string,
  purchaseAmount: string,
  providerName?: string,
): Promise<BonusBuySlot> {
  const response = await fetch(
    `/accounts/${accountId}/bonus-buys/${bonusBuyId}/slots`,
    {
      method: 'POST',
      credentials: 'include',
      headers: jsonHeaders,
      body: JSON.stringify({
        name,
        purchase_amount: purchaseAmount,
        provider_name: providerName?.trim() || undefined,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.addSlot')),
    )
  }

  return response.json() as Promise<BonusBuySlot>
}

export async function patchBonusBuySlot(
  accountId: number,
  bonusBuyId: number,
  slotId: number,
  body: PatchBonusBuySlotInput,
): Promise<BonusBuySlot> {
  const response = await fetch(
    `/accounts/${accountId}/bonus-buys/${bonusBuyId}/slots/${slotId}`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: jsonHeaders,
      body: JSON.stringify(body),
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.updateSlot')),
    )
  }

  return response.json() as Promise<BonusBuySlot>
}

export async function archiveBonusBuySlot(
  accountId: number,
  bonusBuyId: number,
  slotId: number,
): Promise<void> {
  const response = await fetch(
    `/accounts/${accountId}/bonus-buys/${bonusBuyId}/slots/${slotId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.deleteSlot')),
    )
  }
}

export async function fetchBonusBuyWidget(
  accountId: number,
  bonusBuyId: number,
): Promise<BonusBuyWidgetSettings> {
  const response = await fetch(
    `/accounts/${accountId}/bonus-buys/${bonusBuyId}/widget`,
    {
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.loadWidgetSettings')),
    )
  }

  return response.json() as Promise<BonusBuyWidgetSettings>
}

export async function patchBonusBuyWidget(
  accountId: number,
  bonusBuyId: number,
  body: PatchBonusBuyWidgetInput,
): Promise<BonusBuyWidgetSettings> {
  const response = await fetch(
    `/accounts/${accountId}/bonus-buys/${bonusBuyId}/widget`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: jsonHeaders,
      body: JSON.stringify(body),
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.updateWidgetSettings')),
    )
  }

  return response.json() as Promise<BonusBuyWidgetSettings>
}

export async function fetchBonusBuyWidgetPresets(
  accountId: number,
): Promise<BonusBuyWidgetStylePreset[]> {
  const response = await fetch(
    `/accounts/${accountId}/bonus-buy-widget-presets`,
    { credentials: 'include' },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.loadWidgetPresets')),
    )
  }

  return response.json() as Promise<BonusBuyWidgetStylePreset[]>
}

export async function upsertBonusBuyWidgetCustomPreset(
  accountId: number,
  body: UpsertBonusBuyWidgetCustomPresetInput,
): Promise<BonusBuyWidgetStylePreset> {
  const response = await fetch(
    `/accounts/${accountId}/bonus-buy-widget-presets/custom`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: jsonHeaders,
      body: JSON.stringify(body),
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.saveWidgetPreset')),
    )
  }

  return response.json() as Promise<BonusBuyWidgetStylePreset>
}

export async function deleteBonusBuyWidgetCustomPreset(
  accountId: number,
): Promise<void> {
  const response = await fetch(
    `/accounts/${accountId}/bonus-buy-widget-presets/custom`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.deleteWidgetPreset')),
    )
  }
}

export async function fetchPublicBonusBuyWidget(
  bonusBuyId: number,
): Promise<BonusBuyWidgetView> {
  const response = await fetch(`/bonus-buys/${bonusBuyId}/widget`)

  if (response.status === 409) {
    const message = await readErrorMessage(response, 'SESSION_ARCHIVED')
    if (message === 'SESSION_ARCHIVED') {
      throw new BonusBuySessionArchivedError()
    }
    throw new Error(message)
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.loadWidget')),
    )
  }

  return response.json() as Promise<BonusBuyWidgetView>
}

export function isBonusBuyActive(record: Pick<BonusBuyRecord, 'status'>): boolean {
  return record.status === 'active'
}

export function isBonusBuySlotPlaying(slot: Pick<BonusBuySlot, 'status'>): boolean {
  return slot.status === 'playing'
}

export function formatBonusBuySlotStatus(
  status: BonusBuySlotStatus,
  translate?: (key: string) => string,
): string {
  const t = translate ?? ((key: string) => i18n.t(key))
  switch (status) {
    case 'playing':
      return t('bonusBuy.slotStatusPlaying')
    case 'archived':
      return t('bonusBuy.slotStatusArchived')
    case 'pending':
      return t('bonusBuy.slotStatusPending')
  }
}
