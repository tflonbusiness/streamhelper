import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import { notifyMediaInteractiveTrackComplete } from '@/api/media-interactive'
import { MediaInteractiveVideoOverlayShell } from '@/components/media-interactive/MediaInteractiveVideoOverlayShell'
import { StreamWidgetMessage } from '@/components/widget/StreamWidgetMessage'
import { usePinWidgetUiEnglish, widgetUiCopy } from '@/i18n/widget-ui'
import { publicWidgetUnavailableMessage } from '@/lib/public-widget'
import { usePublicMediaInteractiveWidget } from '@/queries/use-media-interactive'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const YT_ENDED = 0
const YT_PLAYING = 1
const YT_BUFFERING = 3

const YT_MIN_WIDTH = 320
const YT_MIN_HEIGHT = 180

type YtPlayer = {
  loadVideoById: (id: string) => void
  playVideo: () => void
  pauseVideo: () => void
  getPlayerState: () => number
  setVolume: (n: number) => void
  unMute: () => void
  mute: () => void
  destroy: () => void
  setSize: (width: number, height: number) => void
}

function isYtActivelyPlaying(state: number) {
  return state === YT_PLAYING || state === YT_BUFFERING
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
    const finish = () => {
      if (window.YT?.Player) {
        resolve()
      }
    }
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      finish()
    }
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(script)
    }
    const waitForYt = () => {
      if (window.YT?.Player) {
        finish()
      } else {
        window.requestAnimationFrame(waitForYt)
      }
    }
    waitForYt()
  })
}

function unlockPlayerAudio(player: YtPlayer, volume: number) {
  player.setVolume(volume)
  if (volume <= 0) {
    player.mute()
    return
  }
  player.unMute()
}

function tryMutedPlay(player: YtPlayer) {
  try {
    player.mute()
  } catch {
    // ignore
  }
  try {
    player.playVideo()
  } catch {
    // ignore
  }
}

export function MediaInteractiveStreamWidgetPage() {
  usePinWidgetUiEnglish()
  const { ucid } = useParams<{ ucid: string }>()
  const accountUcid =
    ucid && UUID_REGEX.test(ucid) ? ucid : null

  const { data: view, isPending, isError } =
    usePublicMediaInteractiveWidget(accountUcid)
  const playerRef = useRef<YtPlayer | null>(null)
  const [playerHostEl, setPlayerHostEl] = useState<HTMLDivElement | null>(null)
  const handlePlayerHostRef = useCallback((node: HTMLDivElement | null) => {
    setPlayerHostEl(node)
  }, [])
  const [playerReady, setPlayerReady] = useState(false)
  const loadedVideoIdRef = useRef<string | null>(null)
  const playbackIntentRef = useRef({
    videoId: null as string | null,
    paused: true,
    volume: 80,
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
    if (!isActive || !accountUcid || !playerHostEl) {
      return
    }
    const host = playerHostEl
    let cancelled = false

    void loadYoutubeApi().then(() => {
      if (cancelled || !window.YT?.Player) {
        return
      }
      if (playerRef.current) {
        return
      }
      playerRef.current = new window.YT.Player(host, {
        height: String(YT_MIN_HEIGHT),
        width: String(YT_MIN_WIDTH),
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
            const intent = playbackIntentRef.current
            if (intent.paused) {
              return
            }
            if (event.data === YT_PLAYING) {
              unlockPlayerAudio(player, intent.volume)
              return
            }
            if (!isYtActivelyPlaying(event.data)) {
              tryMutedPlay(player)
            }
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
      host.replaceChildren()
      setPlayerReady(false)
      loadedVideoIdRef.current = null
    }
  }, [isActive, accountUcid, playerHostEl])

  const drivePlayerFromView = useCallback(() => {
    if (!playerReady || view?.status !== 'active' || !playerRef.current) {
      return
    }

    const player = playerRef.current
    const np = view.playback.nowPlaying
    const videoId = np?.youtubeVideoId ?? null
    const paused = view.playback.paused
    const volume = view.settings.volume
    const showVideo = view.settings.showVideo

    playbackIntentRef.current = { videoId, paused, volume }

    const w = showVideo ? view.settings.overlayWidth : YT_MIN_WIDTH
    const h = showVideo ? view.settings.overlayHeight : YT_MIN_HEIGHT
    try {
      player.setSize(w, h)
    } catch {
      // ignore resize failures during teardown
    }

    player.setVolume(volume)

    if (!videoId) {
      loadedVideoIdRef.current = null
      player.pauseVideo()
      return
    }

    if (paused) {
      player.pauseVideo()
      return
    }

    if (loadedVideoIdRef.current !== videoId) {
      loadedVideoIdRef.current = videoId
      tryMutedPlay(player)
      player.loadVideoById(videoId)
      return
    }

    try {
      const state = player.getPlayerState()
      if (state === YT_PLAYING) {
        unlockPlayerAudio(player, volume)
        return
      }
      if (!isYtActivelyPlaying(state)) {
        tryMutedPlay(player)
      }
    } catch {
      tryMutedPlay(player)
    }
  }, [playerReady, view])

  useEffect(() => {
    drivePlayerFromView()
  }, [drivePlayerFromView])

  useEffect(() => {
    const resume = () => {
      if (document.visibilityState === 'hidden') {
        return
      }
      drivePlayerFromView()
    }
    document.addEventListener('visibilitychange', resume)
    window.addEventListener('focus', resume)
    window.addEventListener('pageshow', resume)
    return () => {
      document.removeEventListener('visibilitychange', resume)
      window.removeEventListener('focus', resume)
      window.removeEventListener('pageshow', resume)
    }
  }, [drivePlayerFromView])

  useEffect(() => {
    if (!playerHostEl || !playerReady) {
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          drivePlayerFromView()
        }
      },
      { threshold: 0.01 },
    )
    observer.observe(playerHostEl)
    return () => {
      observer.disconnect()
    }
  }, [playerHostEl, playerReady, drivePlayerFromView])

  if (!accountUcid) {
    return <StreamWidgetMessage message={widgetUiCopy.accountNotFound} />
  }

  if (isPending) {
    return null
  }

  if (isError || !view) {
    return <StreamWidgetMessage message={widgetUiCopy.accountNotFound} />
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
        playerHostRef={handlePlayerHostRef}
      />
    </Box>
  )
}
