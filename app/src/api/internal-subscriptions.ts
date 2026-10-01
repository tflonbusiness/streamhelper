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

export const SUBSCRIPTION_ADMIN_SORT_FIELDS = [
  'accountId',
  'name',
  'subscriptionPlan',
  'channelSlug',
  'endsAt',
  'updatedAt',
] as const

export type SubscriptionAdminSortField =
  (typeof SUBSCRIPTION_ADMIN_SORT_FIELDS)[number]

export type SubscriptionAdminSortOrder = 'asc' | 'desc'

export type SubscriptionAdminSearchParams = {
  query: string
  page?: number
  pageSize?: number
  sortBy?: SubscriptionAdminSortField
  sortOrder?: SubscriptionAdminSortOrder
}

export type SubscriptionAdminSearchResponse = {
  items: SubscriptionAdminSearchItem[]
  total: number
  page: number
  pageSize: number
}

const jsonHeaders = {
  'Content-Type': 'application/json',
}

const SUBSCRIPTION_ADMIN_PAGE_SIZE = 20

function responseLooksLikeJson(response: Response): boolean {
  const contentType = response.headers.get('content-type') ?? ''
  return contentType.includes('application/json') || contentType.includes('+json')
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  if (!responseLooksLikeJson(response)) {
    if (response.status === 404) {
      return fallback
    }
    return `${fallback} (${response.status})`
  }
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
  params: SubscriptionAdminSearchParams,
): Promise<SubscriptionAdminSearchResponse> {
  const searchParams = new URLSearchParams({
    q: params.query,
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? SUBSCRIPTION_ADMIN_PAGE_SIZE),
    sortBy: params.sortBy ?? 'updatedAt',
    sortOrder: params.sortOrder ?? 'desc',
  })
  const response = await fetch(`/internal/subscriptions?${searchParams}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.subscriptionAdminSearch')),
    )
  }

  if (!responseLooksLikeJson(response)) {
    throw new Error(i18n.t('errors.api.subscriptionAdminSearch'))
  }

  return (await response.json()) as SubscriptionAdminSearchResponse
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

export { SUBSCRIPTION_ADMIN_PAGE_SIZE }
