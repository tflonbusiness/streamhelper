export type AuthUser = {
  id: number
  name: string
  accountId?: number
  accountName?: string
  role?: 'owner' | 'moderator'
  subscriptionPlan?: string
  channelSlug?: string
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

export function kickLoginUrl(): string {
  return '/auth/oauth/kick'
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch('/auth/me', {
    credentials: 'include',
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error('Failed to load session')
  }

  const data = await parseJson<{ user: AuthUser }>(response)
  return data.user
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
    throw new Error(await readErrorMessage(response, 'Could not create moderator'))
  }

  return parseJson<CreateModeratorResult>(response)
}

export async function fetchAccountMembers(
  accountId: number,
): Promise<AccountMember[]> {
  const response = await fetch(`/accounts/${accountId}/members`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Could not load team'))
  }

  const data = await parseJson<{ members: AccountMember[] }>(response)
  return data.members
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
      await readErrorMessage(response, 'Could not get invite link'),
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
      await readErrorMessage(response, 'Could not revoke moderator access'),
    )
  }
}

export async function logout(): Promise<void> {
  await fetch('/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })
}
