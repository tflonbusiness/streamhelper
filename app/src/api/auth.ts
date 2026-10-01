import i18n from '@/i18n/init-i18n'
import type { EntitlementEnvelope } from '@/lib/entitlements'

export type AccountSubscriptionSession = {
  status: 'active' | 'expired' | 'cancelled'
  planTier: string
  endsAt: string
  hasAccess: boolean
}

export type AuthUser = {
  id: number
  name: string
  accountId?: number
  accountUcid?: string
  accountName?: string
  role?: 'owner' | 'moderator'
  subscriptionPlan?: string
  subscription?: AccountSubscriptionSession
  channelSlug?: string
  platformAdmin?: boolean
}

export type LoginSurface = 'streamer' | 'service'

export type AuthSessionSnapshot = {
  user: AuthUser
  loginSurface: LoginSurface
}

export type AccountMember = {
  userId: number
  name: string
  role: 'owner' | 'moderator'
  isActive: boolean
  hasInviteLink: boolean
}

export type CreateModeratorResult = {
  userId: number
  name: string
  joinUrl: string
}

const jsonHeaders = {
  'Content-Type': 'application/json',
}

async function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>
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

export function kickLoginUrl(surface: LoginSurface = 'streamer'): string {
  if (surface === 'service') {
    return '/auth/oauth/kick?surface=service'
  }
  return '/auth/oauth/kick'
}

export async function fetchCurrentUser(): Promise<AuthSessionSnapshot | null> {
  const response = await fetch('/auth/me', {
    credentials: 'include',
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error(i18n.t('errors.failedToLoadSession'))
  }

  const data = await parseJson<{ user: AuthUser; loginSurface?: LoginSurface }>(
    response,
  )
  return {
    user: data.user,
    loginSurface: data.loginSurface ?? 'streamer',
  }
}

export async function setLoginSurface(
  surface: LoginSurface,
): Promise<LoginSurface> {
  const response = await fetch('/auth/surface', {
    method: 'POST',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify({ surface }),
  })

  if (!response.ok) {
    throw new Error(i18n.t('errors.failedToLoadSession'))
  }

  const data = await parseJson<{ loginSurface: LoginSurface }>(response)
  return data.loginSurface
}

export async function createModerator(
  accountId: number,
  name: string,
): Promise<CreateModeratorResult> {
  const response = await fetch(`/accounts/${accountId}/moderators`, {
    method: 'POST',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify({ name }),
  })

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.createModerator')),
    )
  }

  return parseJson<CreateModeratorResult>(response)
}

export type AccountMembersResult = {
  members: AccountMember[]
} & Partial<EntitlementEnvelope>

export async function fetchAccountMembers(
  accountId: number,
): Promise<AccountMembersResult> {
  const response = await fetch(`/accounts/${accountId}/members`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, i18n.t('errors.api.loadTeam')))
  }

  return parseJson<AccountMembersResult>(response)
}

export async function fetchModeratorInviteLink(
  accountId: number,
  memberUserId: number,
): Promise<string> {
  const response = await fetch(
    `/accounts/${accountId}/members/${memberUserId}/invite-link`,
    {
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.getInviteLink')),
    )
  }

  const data = await parseJson<{ joinUrl: string }>(response)
  return data.joinUrl
}

export async function revokeModerator(
  accountId: number,
  memberUserId: number,
): Promise<void> {
  const response = await fetch(
    `/accounts/${accountId}/members/${memberUserId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.revokeModerator')),
    )
  }
}

export async function logout(): Promise<void> {
  await fetch('/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })
}
