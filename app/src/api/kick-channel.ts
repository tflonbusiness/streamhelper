import i18n from '@/i18n/init-i18n'
export type KickChannelDto = {
  slug: string
  streamTitle: string | null
  channelDescription: string | null
  bannerPicture: string | null
  categoryName: string | null
  isLive: boolean
  isMature: boolean
  viewerCount: number | null
  streamThumbnail: string | null
  activeSubscribersCount: number | null
  activeGiftedSubscribersCount: number | null
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

export class KickChannelNotFoundError extends Error {
  constructor() {
    super('Kick channel not connected')
    this.name = 'KickChannelNotFoundError'
  }
}

export async function fetchKickChannel(accountId: number): Promise<KickChannelDto> {
  const response = await fetch(`/accounts/${accountId}/kick/channel`, {
    credentials: 'include',
  })

  if (response.status === 404) {
    throw new KickChannelNotFoundError()
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, i18n.t('errors.api.loadKickChannel')),
    )
  }

  return response.json() as Promise<KickChannelDto>
}
