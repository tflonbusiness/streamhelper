import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import { notifyMediaInteractiveTrackComplete } from '@/api/media-interactive'
import { MediaInteractiveVideoOverlayShell } from '@/components/media-interactive/MediaInteractiveVideoOverlayShell'
import { usePinWidgetUiEnglish } from '@/i18n/widget-ui'
import { publicWidgetUnavailableMessage } from '@/lib/public-widget'
import { usePublicMediaInteractiveWidget } from '@/queries/use-media-interactive'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const YT_ENDED = 0
const YT_PLAYING = 1
const YT_PAUSED = 2
const YT_BUFFERING = 3
const YT_CUED = 5

type YtPlayer = {
  loadVideoById: (id: string) => void
  playVideo: () => void
  pauseVideo: () => void
  setVolume: (n: number) => void
  unMute: () => void
  mute: () => void
  destroy: () => void
  setSize: (width: number, height: number) => void
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: Record<string, unknown>,
      ) => YtPlayer
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

function loadYoutubeApi(): Promise<void> {
  if (window.YT?.Player) {
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    const finish = () => resolve()
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      finish()
    }
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(script)
    } else {
      const waitForYt = () => {
        if (window.YT?.Player) {
          finish()
        } else {
          window.requestAnimationFrame(waitForYt)
        }
      }
      waitForYt()
    }
  })
}

type PlayerSyncState = {
  videoId: string | null
  paused: boolean
  volume: number
}

function syncPlayerToView(
  player: YtPlayer,
  videoId: string | null,
  paused: boolean,
  volume: number,
  last: PlayerSyncState,
) {
  if (volume !== last.volume) {
    player.setVolume(volume)
    if (volume > 0) {
      player.unMute()
    } else {
      player.mute()
    }
    last.volume = volume
  }

  if (!videoId) {
    if (!last.paused) {
      player.pauseVideo()
      last.paused = true
    }
    last.videoId = null
    return
  }

  if (videoId !== last.videoId) {
    player.loadVideoById(videoId)
    last.videoId = videoId
    last.paused = paused
    if (paused) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
    return
  }

  if (paused !== last.paused) {
    if (paused) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
    last.paused = paused
  }
}

function tryResumePlayback(player: YtPlayer, paused: boolean, playerState: number) {
  if (paused) {
    return
  }
  if (
    playerState === YT_PLAYING ||
    playerState === YT_BUFFERING
  ) {
    return
  }
  player.playVideo()
}

export function MediaInteractiveStreamWidgetPage() {
  usePinWidgetUiEnglish()
  const { ucid } = useParams<{ ucid: string }>()
  const accountUcid =
    ucid && UUID_REGEX.test(ucid) ? ucid : null

  const { data: view } = usePublicMediaInteractiveWidget(accountUcid)
  const playerRef = useRef<YtPlayer | null>(null)
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [playerReady, setPlayerReady] = useState(false)
  const playerSyncRef = useRef<PlayerSyncState>({
    videoId: null,
    paused: true,
    volume: 80,
  })
  const playbackIntentRef = useRef({
    videoId: null as string | null,
    paused: true,
  })

  const isActive = view?.status === 'active'

  useEffect(() => {
    const prevBody = document.body.style.overflow
    document.body.style.background = 'transparent'
    document.documentElement.style.background = 'transparent'
    return () => {
      document.body.style.overflow = prevBody
    }
  }, [])

  useEffect(() => {
    if (!isActive || !accountUcid || !hostRef.current) {
      return
    }
    let cancelled = false

    void loadYoutubeApi().then(() => {
      if (cancelled || !window.YT?.Player || !hostRef.current) {
        return
      }
      if (playerRef.current) {
        return
      }
      playerRef.current = new window.YT.Player(hostRef.current, {
        height: '360',
        width: '640',
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            if (!cancelled) {
              setPlayerReady(true)
            }
          },
          onStateChange: (event: { data: number }) => {
            if (event.data === YT_ENDED && accountUcid) {
              void notifyMediaInteractiveTrackComplete(accountUcid)
              return
            }
            const player = playerRef.current
            if (!player) {
              return
            }
            tryResumePlayback(
              player,
              playbackIntentRef.current.paused,
              event.data,
            )
          },
        },
      })
    })

    return () => {
      cancelled = true
      try {
        playerRef.current?.destroy()
      } catch {
        // YouTube may already have detached the iframe from our host node.
      }
      playerRef.current = null
      if (hostRef.current) {
        hostRef.current.replaceChildren()
      }
      setPlayerReady(false)
      playerSyncRef.current = { videoId: null, paused: true, volume: 80 }
    }
  }, [isActive, accountUcid])

  const applyViewToPlayer = useCallback(() => {
    if (!playerReady || view?.status !== 'active' || !playerRef.current) {
      return
    }
    const np = view.playback.nowPlaying
    const videoId = np?.youtubeVideoId ?? null
    const paused = view.playback.paused
    playbackIntentRef.current = { videoId, paused }
    syncPlayerToView(
      playerRef.current,
      videoId,
      paused,
      view.settings.volume,
      playerSyncRef.current,
    )
  }, [playerReady, view])

  useEffect(() => {
    applyViewToPlayer()
  }, [applyViewToPlayer])

  useEffect(() => {
    if (!playerReady || !playerRef.current || view?.status !== 'active') {
      return
    }
    const showVideo = view.settings.showVideo
    const w = showVideo ? view.settings.overlayWidth : 1
    const h = showVideo ? view.settings.overlayHeight : 1
    try {
      playerRef.current.setSize(w, h)
    } catch {
      // ignore resize failures during teardown
    }
  }, [playerReady, view])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        return
      }
      applyViewToPlayer()
      const player = playerRef.current
      if (
        player &&
        !playbackIntentRef.current.paused &&
        playbackIntentRef.current.videoId
      ) {
        player.playVideo()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [applyViewToPlayer])

  if (!accountUcid) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        Account not found.
      </Typography>
    )
  }

  if (!view) {
    return null
  }

  if (view.status === 'unavailable') {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        {view.reason === 'subscription_expired'
          ? publicWidgetUnavailableMessage(
              'mediaInteractive',
              'subscription_expired',
            )
          : 'Overlay unavailable.'}
      </Typography>
    )
  }

  const np = view.playback.nowPlaying
  const showVideo = view.settings.showVideo
  const audioBarWidth = view.settings.audioOverlayWidth ?? 400

  return (
    <Box sx={{ mx: 'auto', maxWidth: '100%', bgcolor: 'transparent' }}>
      <MediaInteractiveVideoOverlayShell
        showVideo={showVideo}
        width={view.settings.overlayWidth}
        height={view.settings.overlayHeight}
        audioBarWidth={audioBarWidth}
        track={np}
        paused={view.playback.paused}
        playerHostRef={hostRef}
      />
    </Box>
  )
}
