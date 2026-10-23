import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useRef } from 'react'
import type {
  GrowingJackpotWidgetStyle,
  PublicGrowingJackpotWidget,
} from '@/api/growing-jackpot'
import { GrowingJackpotWidgetIcon } from '@/components/growing-jackpot/widget/GrowingJackpotWidgetIcon'
import { useGrowingJackpotRoundTimer } from '@/hooks/use-growing-jackpot-round-timer'
import { widgetUiCopy } from '@/i18n/widget-ui'
import { formatGrowingJackpotDisplayPrize } from '@/lib/growing-jackpot-display-prize'
import { firstReactionLightningAudio } from '@/lib/first-reaction-lightning-audio'
import { GROWING_JACKPOT_WIDGET_DEFAULTS } from '@/lib/growing-jackpot-widget-defaults'
import { GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS } from '@/lib/growing-jackpot-widget-style-defaults'

type GrowingJackpotWidgetCardProps = {
  view: PublicGrowingJackpotWidget
  width: number
  height: number
  /** OBS / live widget only — muted in settings preview. */
  playEnterSound?: boolean
}

function resolveStyle(view: PublicGrowingJackpotWidget): GrowingJackpotWidgetStyle {
  if (view.status === 'unavailable') {
    return GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS
  }
  return view.style ?? GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS
}

function WidgetIconColumn({ style }: { style: GrowingJackpotWidgetStyle }) {
  return (
    <Box
      sx={{
        position: 'relative',
        flex: '0 0 30%',
        minWidth: 0,
        maxWidth: '34%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <GrowingJackpotWidgetIcon style={style} />
      </Box>
    </Box>
  )
}

export function GrowingJackpotWidgetCard({
  view,
  width,
  height,
  playEnterSound = true,
}: GrowingJackpotWidgetCardProps) {
  const scale = Math.min(
    width / GROWING_JACKPOT_WIDGET_DEFAULTS.width,
    height / GROWING_JACKPOT_WIDGET_DEFAULTS.height,
  )
  const style = resolveStyle(view)
  const acceptingEndsAt = view.status === 'accepting' ? view.round.endsAt : null
  const acceptingStartedAt =
    view.status === 'accepting' ? view.round.createdAt : null
  const timer = useGrowingJackpotRoundTimer(
    acceptingEndsAt,
    acceptingStartedAt,
  )

  const roundSoundKeyRef = useRef<string | null>(null)
  const winnerSoundKeyRef = useRef<string | null>(null)
  const wasWinnerRef = useRef(false)

  useEffect(() => {
    if (!playEnterSound || view.status !== 'accepting') {
      return
    }
    const soundKey = `${view.round.id}:${view.round.createdAt}`
    if (roundSoundKeyRef.current === soundKey) {
      return
    }
    roundSoundKeyRef.current = soundKey
    firstReactionLightningAudio.playLightning()
  }, [playEnterSound, view])

  useEffect(() => {
    const isWinner = view.status === 'winner'
    if (!playEnterSound) {
      wasWinnerRef.current = isWinner
      return
    }
    if (isWinner && !wasWinnerRef.current) {
      const round = view.round
      const soundKey =
        round.proofToken ?? String(round.id) ?? round.winnerDisplayName ?? 'winner'
      if (winnerSoundKeyRef.current !== soundKey) {
        winnerSoundKeyRef.current = soundKey
        firstReactionLightningAudio.playWinner()
      }
    }
    if (!isWinner) {
      winnerSoundKeyRef.current = null
    }
    wasWinnerRef.current = isWinner
  }, [playEnterSound, view])

  if (view.status === 'idle' || view.status === 'no_participants') {
    return (
      <Box
        aria-hidden
        sx={{ width, height, bgcolor: 'transparent' }}
      />
    )
  }

  if (view.status === 'unavailable') {
    return (
      <Box sx={{ width, height, p: 2 }}>
        <Typography color="text.secondary">
          {widgetUiCopy.subscriptionExpired}
        </Typography>
      </Box>
    )
  }

  const round =
    view.status === 'accepting' || view.status === 'winner'
      ? view.round
      : null

  if (!round) {
    return null
  }

  const prizeDisplayCap =
    view.status === 'accepting' || view.status === 'winner'
      ? view.settings.prizeDisplayCap
      : null

  if (view.status === 'winner') {
    return (
      <Box
        sx={{
          width,
          height,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          gap: 0.5,
        px: 0.75,
        py: 0.5,
      }}
    >
      <WidgetIconColumn style={style} />
      <Stack
          spacing={0.35}
          sx={{
            flex: '1 1 auto',
            minWidth: 0,
            justifyContent: 'center',
            pl: 0.25,
            pr: 0.5,
          }}
        >
          <Typography
            sx={{
              color: style.prizeText,
              fontSize: 'clamp(0.65rem, 2.2vw, 0.85rem)',
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            {widgetUiCopy.growingJackpotWinner}
          </Typography>
          <Typography
            sx={{
              color: style.keywordText,
              fontSize: 'clamp(1.35rem, 5.5vw, 2.5rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              wordBreak: 'break-word',
            }}
            title={round.winnerDisplayName ?? undefined}
          >
            {round.winnerDisplayName ?? '—'}
          </Typography>
        </Stack>
      </Box>
    )
  }

  const keyword = view.joinKeyword

  return (
    <Box
      sx={{
        width,
        height,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 0.5,
        px: 0.75,
        py: 0.5,
      }}
    >
      <WidgetIconColumn style={style} />
      <Box
        sx={{
          flex: '1 1 auto',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: `${6 * scale}px`,
          pl: 0.25,
          pr: 0.5,
        }}
      >
        <Typography
          sx={{
            color: style.prizeText,
            fontSize: 'clamp(0.7rem, 2.4vw, 0.9rem)',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            lineHeight: 1.25,
          }}
        >
          {widgetUiCopy.growingJackpotTitle}
        </Typography>
        <Typography
          sx={{
            color: style.keywordText,
            fontSize: 'clamp(1.2rem, 4.5vw, 2rem)',
            fontWeight: 800,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            lineHeight: 1.08,
            wordBreak: 'break-word',
          }}
          title={keyword}
        >
          {keyword}
        </Typography>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          <Stat
            label={widgetUiCopy.growingJackpotPlayers}
            value={String(round.participantCount)}
            scale={scale}
            dimColor={style.prizeTextDim}
            valueColor={style.keywordText}
          />
          <Stat
            label={widgetUiCopy.growingJackpotPrize}
            value={formatGrowingJackpotDisplayPrize(
              round.displayPrize,
              prizeDisplayCap,
            )}
            scale={scale}
            dimColor={style.prizeTextDim}
            valueColor={style.prizeText}
          />
          {timer.secondsLeft !== null ? (
            <Stat
              label={widgetUiCopy.growingJackpotTime}
              value={String(timer.secondsLeft)}
              scale={scale}
              dimColor={style.prizeTextDim}
              valueColor={style.timerText}
            />
          ) : null}
        </Stack>
      </Box>
    </Box>
  )
}

function Stat(props: {
  label: string
  value: string
  scale: number
  dimColor: string
  valueColor: string
}) {
  return (
    <Stack spacing={0.25}>
      <Typography
        sx={{
          color: props.dimColor,
          fontSize: Math.max(10, 11 * props.scale),
          fontWeight: 600,
          textTransform: 'uppercase',
        }}
      >
        {props.label}
      </Typography>
      <Typography
        sx={{
          color: props.valueColor,
          fontSize: Math.max(18, 22 * props.scale),
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.1,
        }}
      >
        {props.value}
      </Typography>
    </Stack>
  )
}
