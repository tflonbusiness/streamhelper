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
