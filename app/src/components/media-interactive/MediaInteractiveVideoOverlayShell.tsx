import { Box, Stack } from '@mui/material'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import { alpha, styled } from '@mui/material/styles'
import type { Ref } from 'react'
import { useTranslation } from 'react-i18next'
import type { MediaInteractiveItem } from '@/api/media-interactive'
import { MediaInteractivePlayerCard } from '@/components/media-interactive/MediaInteractivePlayerCard'

type MediaInteractiveVideoOverlayShellProps = {
  showVideo: boolean
  width: number
  height: number
  audioBarWidth: number
  track: MediaInteractiveItem | null
  paused: boolean
  playerHostRef: Ref<HTMLDivElement | null>
}

const StyledShell = styled(Stack, {
  shouldForwardProp: (prop) => prop !== 'shellWidth' && prop !== 'showVideo',
})<{ shellWidth: number; showVideo: boolean }>(({ theme, shellWidth, showVideo }) => ({
  width: shellWidth,
  maxWidth: '100%',
  position: 'relative',
  ...(showVideo
    ? {
        borderRadius: theme.spacing(1.75),
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.common.white, 0.14)}`,
        boxShadow: `
    0 0 0 1px ${alpha(theme.palette.common.black, 0.35)},
    0 16px 48px ${alpha(theme.palette.common.black, 0.55)}
  `,
        backgroundColor: alpha(theme.palette.common.black, 0.88),
      }
    : {}),
}))

const StyledVideoStage = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'stageHeight' && prop !== 'dimmed' && prop !== 'hidden',
})<{ stageHeight: number; dimmed?: boolean; hidden?: boolean }>(
  ({ theme, stageHeight, dimmed, hidden }) => ({
    position: hidden ? 'fixed' : 'relative',
    width: hidden ? 320 : '100%',
    height: hidden ? 180 : stageHeight,
    left: hidden ? -10_000 : undefined,
    top: hidden ? 0 : undefined,
    overflow: 'hidden',
    opacity: hidden ? 0 : 1,
    pointerEvents: hidden ? 'none' : 'auto',
    backgroundColor: hidden ? 'transparent' : '#000',
    borderTop: hidden
      ? 'none'
      : `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
    '& iframe': {
      display: 'block',
    },
    ...(dimmed && !hidden
      ? {
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundColor: alpha(theme.palette.common.black, 0.42),
            pointerEvents: 'none',
          },
        }
      : {}),
  }),
)

const StyledPausedBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: theme.spacing(1.5),
  bottom: theme.spacing(1.5),
  zIndex: 2,
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.75),
  padding: theme.spacing(0.5, 1.25),
  borderRadius: theme.spacing(3),
  backgroundColor: alpha(theme.palette.common.black, 0.72),
  border: `1px solid ${alpha(theme.palette.common.white, 0.16)}`,
  color: theme.palette.common.white,
  fontSize: '0.6875rem',
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  pointerEvents: 'none',
}))

export function MediaInteractiveVideoOverlayShell({
  showVideo,
  width,
  height,
  audioBarWidth,
  track,
  paused,
  playerHostRef,
}: MediaInteractiveVideoOverlayShellProps) {
  const { t } = useTranslation()
  const showPausedBadge = Boolean(track) && paused && showVideo
  const barWidth = showVideo ? width : audioBarWidth

  return (
    <StyledShell shellWidth={barWidth} showVideo={showVideo}>
      <MediaInteractivePlayerCard
        variant="overlay"
        track={track}
        paused={paused}
        overlayBarWidth={barWidth}
        overlayVideoChrome={showVideo}
      />
      <StyledVideoStage
        stageHeight={height}
        dimmed={showPausedBadge}
        hidden={!showVideo}
      >
        <Box
          ref={playerHostRef}
          sx={{ width: '100%', height: '100%' }}
        />
        {showPausedBadge ? (
          <StyledPausedBadge>
            <PauseRoundedIcon sx={{ fontSize: 16 }} />
            {t('mediaInteractive.overlayPaused')}
          </StyledPausedBadge>
        ) : null}
      </StyledVideoStage>
    </StyledShell>
  )
}
