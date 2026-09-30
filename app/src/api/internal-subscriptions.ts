import i18n from '@/i18n/init-i18n'
import type { AccountSubscriptionSession } from '@/api/auth'

export type SubscriptionAdminSearchItem = {
  accountId: number
  ucid: string
  name: string
  subscriptionPlan: string
  channelSlug: string | null
  subscription: AccountSubscriptionSession
}

export type SubscriptionAdminAccountDetail = SubscriptionAdminSearchItem & {
  owners: { userId: number; name: string }[]
}

export type SubscriptionAdminUpdatePayload = {
  mode: 'revoked' | 'trial' | 'paid'
  paidPlan?: 'pro' | 'studio'
  endsAt?: string
}

const jsonHeaders = {
  'Content-Type': 'application/json',
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json()
    if (data && typeof data.message === 'string') {
      return data.message
    }
    if (Array.isArray(data?.message)) {
      return data.message.join(', ')
    }
  } catch {
    // ignore
  }
  return fallback
}

export async function searchSubscriptionAdminAccounts(
  query: string,
): Promise<SubscriptionAdminSearchItem[]> {
  const params = new URLSearchParams({ q: query })
  const response = await fetch(`/internal/subscriptions?${params}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.subscriptionAdminSearch')),
    )
  }

  const data = (await response.json()) as { items: SubscriptionAdminSearchItem[] }
  return data.items
}

export async function fetchSubscriptionAdminAccount(
  accountId: number,
): Promise<SubscriptionAdminAccountDetail> {
  const response = await fetch(`/internal/subscriptions/${accountId}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.subscriptionAdminLoad')),
    )
  }

  const data = (await response.json()) as { account: SubscriptionAdminAccountDetail }
  return data.account
}

export async function updateSubscriptionAdminAccount(
  accountId: number,
  payload: SubscriptionAdminUpdatePayload,
): Promise<SubscriptionAdminAccountDetail> {
  const response = await fetch(`/internal/subscriptions/${accountId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.subscriptionAdminSave')),
    )
  }

  const data = (await response.json()) as { account: SubscriptionAdminAccountDetail }
  return data.account
}
