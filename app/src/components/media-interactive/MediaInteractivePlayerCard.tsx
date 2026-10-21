import {
  Box,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded'
import { alpha, styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { formatDuration, type MediaInteractiveItem } from '@/api/media-interactive'
import { widgetUiCopy } from '@/i18n/widget-ui'
import { moduleLiveHeroCardSx } from '@/lib/module-page-chrome'
import { MediaInteractiveMarqueeText } from '@/components/media-interactive/MediaInteractiveMarqueeText'
import { youtubeThumbnailUrl } from '@/lib/youtube-thumbnail-url'

export type MediaInteractivePlayerCardProps = {
  variant: 'workspace' | 'overlay'
  track: MediaInteractiveItem | null | undefined
  paused?: boolean
  loading?: boolean
  emptyMessage?: string
  /** Fixed bar width for stream overlay (px). */
  overlayBarWidth?: number
  /** Top chrome fused with video frame (no outer rounding on bar). */
  overlayVideoChrome?: boolean
  onTogglePause?: () => void
  onSkip?: () => void
}

const WORKSPACE_THUMB = 64
const OVERLAY_THUMB = 52

const StyledWorkspaceCard = styled(Stack, {
  shouldForwardProp: (prop) => prop !== 'empty',
})<{ empty?: boolean }>(({ theme, empty }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  ...(moduleLiveHeroCardSx('danger', theme, empty) as object),
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
}))

const StyledOverlayCard = styled(Stack, {
  shouldForwardProp: (prop) => prop !== 'barWidth' && prop !== 'videoChrome',
})<{ barWidth: number; videoChrome?: boolean }>(({ theme, barWidth, videoChrome }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(videoChrome ? 1.25 : 1.5),
  width: barWidth,
  maxWidth: '100%',
  boxSizing: 'border-box',
  padding: videoChrome
    ? theme.spacing(1.25, 1.5, 1.125, 1.5)
    : theme.spacing(1.25, 1.5),
  borderRadius: videoChrome ? 0 : theme.spacing(1.5),
  backgroundColor: videoChrome
    ? 'transparent'
    : alpha(theme.palette.common.black, 0.72),
  backdropFilter: videoChrome ? 'none' : 'blur(12px)',
  border: videoChrome ? 'none' : `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
  boxShadow: videoChrome ? 'none' : `0 8px 32px ${alpha(theme.palette.common.black, 0.45)}`,
}))

const StyledThumb = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'size' && prop !== 'overlay',
})<{ size: number; overlay?: boolean }>(({ theme, size, overlay }) => ({
  width: size,
  height: size,
  flexShrink: 0,
  borderRadius: overlay ? theme.spacing(1) : theme.spacing(1.25),
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: overlay
    ? alpha(theme.palette.common.white, 0.08)
    : alpha(theme.palette.text.primary, 0.06),
  border: `1px solid ${alpha(
    overlay ? theme.palette.common.white : theme.palette.divider,
    overlay ? 0.14 : 0.35,
  )}`,
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
}))

const StyledMeta = styled(Stack)({
  flex: 1,
  minWidth: 0,
})

const StyledTitle = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'overlay',
})<{ overlay?: boolean }>(({ overlay }) => ({
  fontWeight: 700,
  fontSize: overlay ? '0.9375rem' : '1rem',
  lineHeight: 1.35,
  color: overlay ? '#fff' : undefined,
  overflow: overlay ? 'visible' : 'hidden',
  textOverflow: overlay ? 'clip' : 'ellipsis',
  whiteSpace: overlay ? 'normal' : 'nowrap',
}))

const StyledSubtitle = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'overlay',
})<{ overlay?: boolean }>(({ theme, overlay }) => ({
  fontSize: '0.75rem',
  lineHeight: 1.4,
  color: overlay ? alpha(theme.palette.common.white, 0.72) : theme.palette.text.secondary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}))

const StyledTransport = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  flexShrink: 0,
}))

const StyledPlayButton = styled(IconButton)(({ theme }) => ({
  width: 44,
  height: 44,
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.error.dark,
  },
  '&.Mui-disabled': {
    backgroundColor: alpha(theme.palette.error.main, 0.35),
    color: alpha(theme.palette.error.contrastText, 0.7),
  },
}))

function TrackThumb({
  track,
  size,
  overlay,
}: {
  track: MediaInteractiveItem | null | undefined
  size: number
  overlay?: boolean
}) {
  if (track?.youtubeVideoId) {
    return (
      <StyledThumb size={size} overlay={overlay}>
        <img
          src={youtubeThumbnailUrl(track.youtubeVideoId)}
          alt=""
          loading="lazy"
        />
      </StyledThumb>
    )
  }
  return (
    <StyledThumb size={size} overlay={overlay}>
      <MusicNoteIcon
        fontSize="small"
        sx={{
          color: overlay ? 'common.white' : 'text.secondary',
          opacity: 0.85,
        }}
      />
    </StyledThumb>
  )
}

export function MediaInteractivePlayerCard({
  variant,
  track,
  paused = false,
  loading,
  emptyMessage,
  overlayBarWidth = 400,
  overlayVideoChrome = false,
  onTogglePause,
  onSkip,
}: MediaInteractivePlayerCardProps) {
  const { t } = useTranslation()
  const overlay = variant === 'overlay'
  const thumbSize = overlay
    ? overlayVideoChrome
      ? 44
      : OVERLAY_THUMB
    : WORKSPACE_THUMB
  const empty = !track
  const controlsDisabled = empty || loading

  const emptyText = overlay
    ? widgetUiCopy.mediaInteractiveQueueIdle
    : emptyMessage ?? t('mediaInteractive.nothingPlaying')
  const emptyHint = overlay
    ? widgetUiCopy.mediaInteractiveQueueIdleHint
    : t('mediaInteractive.transportEmptyHint')

  const body = (
    <>
      <TrackThumb track={track} size={thumbSize} overlay={overlay} />
      <StyledMeta>
        {loading ? (
          <>
            <Skeleton variant="text" width="85%" />
            <Skeleton variant="text" width="55%" />
          </>
        ) : empty ? (
          <>
            <StyledTitle overlay={overlay} variant="body2">
              {emptyText}
            </StyledTitle>
            <StyledSubtitle overlay={overlay} variant="caption">
              {emptyHint}
            </StyledSubtitle>
          </>
        ) : (
          <>
            {overlay ? (
              <StyledTitle overlay={overlay} variant="body2" component="div">
                <MediaInteractiveMarqueeText text={track.title} />
              </StyledTitle>
            ) : (
              <StyledTitle overlay={overlay} variant="body2" title={track.title}>
                {track.title}
              </StyledTitle>
            )}
            <StyledSubtitle overlay={overlay} variant="caption">
              {overlay
                ? `${track.requesterNick} · ${formatDuration(track.durationSeconds)}`
                : `${t('mediaInteractive.requestedBy', {
                    nick: track.requesterNick,
                  })} · ${formatDuration(track.durationSeconds)}`}
            </StyledSubtitle>
          </>
        )}
      </StyledMeta>
      {variant === 'workspace' ? (
        <StyledTransport>
          <StyledPlayButton
            size="small"
            disabled={controlsDisabled}
            onClick={onTogglePause}
            aria-label={
              paused
                ? t('mediaInteractive.resume')
                : t('mediaInteractive.pause')
            }
          >
            {paused ? (
              <PlayArrowRoundedIcon />
            ) : (
              <PauseRoundedIcon />
            )}
          </StyledPlayButton>
          <IconButton
            size="small"
            disabled={controlsDisabled}
            onClick={onSkip}
            aria-label={t('mediaInteractive.skip')}
          >
            <SkipNextRoundedIcon />
          </IconButton>
        </StyledTransport>
      ) : null}
    </>
  )

  if (variant === 'overlay') {
    return (
      <StyledOverlayCard barWidth={overlayBarWidth} videoChrome={overlayVideoChrome}>
        {body}
      </StyledOverlayCard>
    )
  }

  return (
    <StyledWorkspaceCard empty={empty && !loading}>
      {body}
    </StyledWorkspaceCard>
  )
}
