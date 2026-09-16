const jsonHeaders = {
  'Content-Type': 'application/json',
}

export type BonusBuyRecord = {
  id: number
  accountId: number
  title: string
  startBalance: string
  isActive: boolean
  createdAt: string
  createdByUserId: number
  createdByName: string
}

export type BonusBuySlot = {
  id: number
  bonusBuyId: number
  createdByUserId: number
  createdByName: string
  slotName: string
  nickProvider: string | null
  purchaseAmount: string
  winAmount: string | null
  multiplier: string | null
  isNowPlaying: boolean
  createdAt: string
}

export type PatchBonusBuyInput = {
  title?: string
  start_balance?: string
}

export type PatchBonusBuySlotInput = {
  slot_name?: string
  nick_provider?: string | null
  purchase_amount?: string
  win_amount?: string | null
  is_now_playing?: boolean
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
      await readErrorMessage(response, 'Could not load bonus buy'),
    )
  }

  return response.json() as Promise<BonusBuyRecord>
}

export async function fetchBonusBuys(
  accountId: number,
): Promise<BonusBuyRecord[]> {
  const response = await fetch(`/accounts/${accountId}/bonus-buys`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not load bonus buy history'),
    )
  }

  const data = (await response.json()) as { records: BonusBuyRecord[] }
  return data.records
}

export async function createBonusBuy(
  accountId: number,
  title: string,
  startBalance: string,
): Promise<BonusBuyRecord> {
  const response = await fetch(`/accounts/${accountId}/bonus-buys`, {
    method: 'POST',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify({ title, start_balance: startBalance }),
  })

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not create bonus buy'),
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
      await readErrorMessage(response, 'Could not update bonus buy session'),
    )
  }

  return response.json() as Promise<BonusBuyRecord>
}

export async function endBonusBuy(
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
      await readErrorMessage(response, 'Could not end bonus buy session'),
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
      await readErrorMessage(response, 'Could not load bonus buy slots'),
    )
  }

  return response.json() as Promise<BonusBuySlot[]>
}

export async function createBonusBuySlot(
  accountId: number,
  bonusBuyId: number,
  slotName: string,
  purchaseAmount: string,
  nickProvider?: string,
): Promise<BonusBuySlot> {
  const response = await fetch(
    `/accounts/${accountId}/bonus-buys/${bonusBuyId}/slots`,
    {
      method: 'POST',
      credentials: 'include',
      headers: jsonHeaders,
      body: JSON.stringify({
        slot_name: slotName,
        purchase_amount: purchaseAmount,
        nick_provider: nickProvider?.trim() || undefined,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Could not add slot'),
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
      await readErrorMessage(response, 'Could not update slot'),
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
      await readErrorMessage(response, 'Could not delete slot'),
    )
  }
}
