import { readApiErrorMessage as readErrorMessage } from '@/api/read-api-error-message'
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
