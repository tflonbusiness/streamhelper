const jsonHeaders = { 'Content-Type': 'application/json' }

export type MediaInteractiveBackupCutover = 'immediate' | 'finish_current_track'

export type MediaInteractiveItem = {
  id: number
  listKind: 'queue' | 'backup'
  source: 'viewer' | 'staff'
  youtubeUrl: string
  youtubeVideoId: string
  title: string
  durationSeconds: number
  requesterNick: string
  pointsCharged: number
  status: string
  rejectReason: string | null
  sortOrder: number
  createdAt: string
}

export type MediaInteractiveSettings = {
  volume: number
  showVideo: boolean
  overlayWidth: number
  overlayHeight: number
  audioOverlayWidth: number
  backupCutover: MediaInteractiveBackupCutover
  maxViewerTrackDurationSeconds: number
  kickRewardIds: string[]
  playbackPaused: boolean
  activeSource: 'queue' | 'backup'
  playingItemId: number | null
}

export type MediaInteractiveQueueResponse = {
  items: MediaInteractiveItem[]
  playback: {
    settings: MediaInteractiveSettings
    nowPlaying: MediaInteractiveItem | null
  }
}

export type MediaInteractiveBurnedPoints = {
  burnedTotal: number
  scope: 'utc_day'
  ledger: Array<{
    id: number
    title: string
    requesterNick: string
    pointsCharged: number
    status: string
    createdAt: string
  }>
}

export type MediaInteractivePublicWidget =
  | { status: 'unavailable'; reason: string }
  | {
      status: 'active'
      settings: {
        volume: number
        showVideo: boolean
        overlayWidth: number
        overlayHeight: number
        audioOverlayWidth: number
        backupCutover: MediaInteractiveBackupCutover
      }
      playback: {
        paused: boolean
        activeSource: 'queue' | 'backup'
        nowPlaying: MediaInteractiveItem | null
        deferredQueueItemId: number | null
      }
    }

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string }
    return data.message ?? response.statusText
  } catch {
    return response.statusText
  }
}

export async function fetchMediaInteractiveSettings(
  accountId: number,
): Promise<MediaInteractiveSettings> {
  const response = await fetch(`/accounts/${accountId}/media-interactive/settings`, {
    credentials: 'include',
  })
  if (!response.ok) throw new Error(await readError(response))
  return response.json() as Promise<MediaInteractiveSettings>
}

export async function patchMediaInteractiveSettings(
  accountId: number,
  patch: Partial<{
    volume: number
    showVideo: boolean
    overlayWidth: number
    overlayHeight: number
    audioOverlayWidth: number
    backupCutover: MediaInteractiveBackupCutover
    maxViewerTrackDurationSeconds: number
    kickRewardIds: string[]
  }>,
): Promise<MediaInteractiveSettings> {
  const response = await fetch(`/accounts/${accountId}/media-interactive/settings`, {
    method: 'PATCH',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify({
      volume: patch.volume,
      show_video: patch.showVideo,
      overlay_width: patch.overlayWidth,
      overlay_height: patch.overlayHeight,
      audio_overlay_width: patch.audioOverlayWidth,
      backup_cutover: patch.backupCutover,
      max_viewer_track_duration_seconds: patch.maxViewerTrackDurationSeconds,
      kick_reward_ids: patch.kickRewardIds,
    }),
  })
  if (!response.ok) throw new Error(await readError(response))
  return response.json() as Promise<MediaInteractiveSettings>
}

export async function fetchMediaInteractiveQueue(
  accountId: number,
  listKind: 'queue' | 'backup',
): Promise<MediaInteractiveQueueResponse> {
  const response = await fetch(
    `/accounts/${accountId}/media-interactive/queue?list=${listKind}`,
    { credentials: 'include' },
  )
  if (!response.ok) throw new Error(await readError(response))
  return response.json() as Promise<MediaInteractiveQueueResponse>
}

export async function staffEnqueueYoutube(
  accountId: number,
  url: string,
  listKind: 'queue' | 'backup',
): Promise<{ items: MediaInteractiveItem[] }> {
  const response = await fetch(
    `/accounts/${accountId}/media-interactive/staff-enqueue`,
    {
      method: 'POST',
      credentials: 'include',
      headers: jsonHeaders,
      body: JSON.stringify({ url, list_kind: listKind }),
    },
  )
  if (!response.ok) throw new Error(await readError(response))
  return response.json() as Promise<{ items: MediaInteractiveItem[] }>
}

export async function reorderMediaInteractive(
  accountId: number,
  listKind: 'queue' | 'backup',
  orderedIds: number[],
): Promise<{ items: MediaInteractiveItem[] }> {
  const response = await fetch(`/accounts/${accountId}/media-interactive/reorder`, {
    method: 'PUT',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify({ list_kind: listKind, ordered_ids: orderedIds }),
  })
  if (!response.ok) throw new Error(await readError(response))
  return response.json() as Promise<{ items: MediaInteractiveItem[] }>
}

export async function removeMediaInteractiveItem(
  accountId: number,
  itemId: number,
): Promise<void> {
  const response = await fetch(
    `/accounts/${accountId}/media-interactive/items/${itemId}`,
    { method: 'DELETE', credentials: 'include' },
  )
  if (!response.ok && response.status !== 204) {
    throw new Error(await readError(response))
  }
}

export async function pauseMediaInteractive(
  accountId: number,
  paused: boolean,
): Promise<void> {
  const response = await fetch(`/accounts/${accountId}/media-interactive/pause`, {
    method: 'POST',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify({ paused }),
  })
  if (!response.ok) throw new Error(await readError(response))
}

export async function skipMediaInteractive(accountId: number): Promise<void> {
  const response = await fetch(`/accounts/${accountId}/media-interactive/skip`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!response.ok) throw new Error(await readError(response))
}

export async function fetchMediaInteractiveBurnedPoints(
  accountId: number,
): Promise<MediaInteractiveBurnedPoints> {
  const response = await fetch(
    `/accounts/${accountId}/media-interactive/burned-points`,
    { credentials: 'include' },
  )
  if (!response.ok) throw new Error(await readError(response))
  return response.json() as Promise<MediaInteractiveBurnedPoints>
}

export async function fetchPublicMediaInteractiveWidget(
  accountUcid: string,
): Promise<MediaInteractivePublicWidget> {
  const response = await fetch(`/media-interactive/widget/${accountUcid}`)
  if (!response.ok) throw new Error(await readError(response))
  return response.json() as Promise<MediaInteractivePublicWidget>
}

export async function notifyMediaInteractiveTrackComplete(
  accountUcid: string,
): Promise<void> {
  await fetch(`/media-interactive/widget/${accountUcid}/complete`, {
    method: 'POST',
  })
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m >= 60) {
    const h = Math.floor(m / 60)
    const rm = m % 60
    return `${h}:${String(rm).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}
