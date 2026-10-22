import { Box, Typography } from '@mui/material'
import { useEffect, useRef } from 'react'
import type { PublicFirstReactionWidgetView } from '@/api/first-reaction'
import { FirstReactionWidgetBolt } from '@/components/first-reaction/widget/FirstReactionWidgetBolt'
import {
  FIRST_REACTION_WIDGET_ENTER_MS,
  FIRST_REACTION_WIDGET_EXIT_MS,
  firstReactionWidgetEnter,
  firstReactionWidgetExit,
} from '@/components/first-reaction/widget/first-reaction-widget-enter-exit'
import { useFirstReactionAcceptTimer } from '@/hooks/use-first-reaction-accept-timer'
import { useFirstReactionWidgetVisibility } from '@/hooks/use-first-reaction-widget-visibility'
import { widgetUiCopy } from '@/i18n/widget-ui'
import { firstReactionLightningAudio } from '@/lib/first-reaction-lightning-audio'
import { FIRST_REACTION_WIDGET_STYLE_DEFAULTS } from '@/lib/first-reaction-widget-style-defaults'
import {
  getFirstReactionWidgetWinnerDisplayName,
  isFirstReactionWidgetAccepting,
  isFirstReactionWidgetOverlayVisible,
} from '@/lib/first-reaction-widget-view'

type FirstReactionWidgetCardProps = {
  view: PublicFirstReactionWidgetView & { status: 'active' }
  width: number
  height: number
  /** OBS / live widget only — muted in settings preview. */
  playEnterSound?: boolean
}

type WidgetDisplayFrame = {
  mode: 'accepting' | 'winner'
  keyword: string
  winnerDisplayName: string
  acceptDeadlineAt: string | null
  acceptingStartedAt: string | null
}

export function FirstReactionWidgetCard({
  view,
  width,
  height,
  playEnterSound = true,
}: FirstReactionWidgetCardProps) {
  const isAccepting = isFirstReactionWidgetAccepting(view)
  const winnerDisplayName = getFirstReactionWidgetWinnerDisplayName(view)
  const isWinnerReveal = winnerDisplayName !== null
  const shouldShowOverlay = isFirstReactionWidgetOverlayVisible(view)
  const style = view.style ?? FIRST_REACTION_WIDGET_STYLE_DEFAULTS

  const { phase, isRendered, handleAnimationEnd } =
    useFirstReactionWidgetVisibility(shouldShowOverlay)

  const keywordRef = useRef(view.keyword)
  const displayFrameRef = useRef<WidgetDisplayFrame | null>(null)
  const lightningSoundKeyRef = useRef<string | null>(null)
  const winnerSoundKeyRef = useRef<string | null>(null)
  const wasWinnerRevealRef = useRef(false)

  useEffect(() => {
    if (view.keyword) {
      keywordRef.current = view.keyword
    }
  }, [view.keyword])

  useEffect(() => {
    if (phase === 'hidden') {
      displayFrameRef.current = null
    }
  }, [phase])

  useEffect(() => {
    if (!playEnterSound || phase !== 'entering' || !isAccepting) {
      return
    }
    const soundKey = view.acceptingStartedAt ?? view.keyword ?? 'draw'
    if (lightningSoundKeyRef.current === soundKey) {
      return
    }
    lightningSoundKeyRef.current = soundKey
    firstReactionLightningAudio.playLightning()
  }, [playEnterSound, phase, isAccepting, view.acceptingStartedAt, view.keyword])

  useEffect(() => {
    if (!playEnterSound) {
      wasWinnerRevealRef.current = isWinnerReveal
      return
    }
    if (isWinnerReveal && !wasWinnerRevealRef.current) {
      const soundKey =
        view.winner?.proofToken ??
        (view.winner?.id != null ? String(view.winner.id) : null) ??
        winnerDisplayName
      if (soundKey && winnerSoundKeyRef.current !== soundKey) {
        winnerSoundKeyRef.current = soundKey
        firstReactionLightningAudio.playWinner()
      }
    }
    if (!isWinnerReveal) {
      winnerSoundKeyRef.current = null
    }
    wasWinnerRevealRef.current = isWinnerReveal
  }, [
    playEnterSound,
    isWinnerReveal,
    winnerDisplayName,
    view.winner?.id,
    view.winner?.proofToken,
  ])

  if (isWinnerReveal && winnerDisplayName) {
    displayFrameRef.current = {
      mode: 'winner',
      keyword: view.keyword ?? keywordRef.current ?? '',
      winnerDisplayName,
      acceptDeadlineAt: null,
      acceptingStartedAt: null,
    }
  } else if (isAccepting) {
    const keyword = view.keyword ?? keywordRef.current
    if (keyword) {
      displayFrameRef.current = {
        mode: 'accepting',
        keyword,
        winnerDisplayName: '',
        acceptDeadlineAt: view.acceptDeadlineAt,
        acceptingStartedAt: view.acceptingStartedAt,
      }
    }
  }

  const display = displayFrameRef.current

  const timer = useFirstReactionAcceptTimer(
    display?.mode === 'accepting' && isAccepting
      ? display.acceptDeadlineAt
      : null,
    display?.mode === 'accepting' && isAccepting
      ? display.acceptingStartedAt
      : null,
  )

  if (!isRendered || !display) {
    return <Box aria-hidden sx={{ width, height, bgcolor: 'transparent' }} />
  }

  const isWinnerFrame = display.mode === 'winner'
  const keyword = display.keyword

  const timerLabel =
    display.mode === 'accepting' &&
    isAccepting &&
    timer.secondsLeft !== null &&
    display.acceptDeadlineAt
      ? widgetUiCopy.firstReactionSecondsLeft.replace(
          '{{seconds}}',
          String(timer.secondsLeft),
        )
      : null

  const hint = isWinnerFrame
    ? widgetUiCopy.firstReactionWinner
    : widgetUiCopy.firstReactionCta
  const headline = isWinnerFrame ? display.winnerDisplayName : keyword
  const showKeywordSubline = isWinnerFrame && Boolean(keyword)

  const ariaLabel = isWinnerFrame
    ? keyword
      ? `${hint}. ${headline}. ${keyword}`
      : `${hint}. ${headline}`
    : timerLabel
      ? `${hint}. ${headline}. ${timerLabel}`
      : `${hint}. ${headline}`

  return (
    <Box
      role="status"
      aria-label={ariaLabel}
      onAnimationEnd={handleAnimationEnd}
      sx={{
        position: 'relative',
        width,
        height,
        boxSizing: 'border-box',
        bgcolor: 'transparent',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 0.5,
        px: 1,
        py: 0.75,
        opacity: phase === 'visible' ? 1 : undefined,
        transformOrigin: 'center center',
        willChange: 'opacity, transform',
        animation:
          phase === 'entering'
            ? `${firstReactionWidgetEnter} ${FIRST_REACTION_WIDGET_ENTER_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`
            : phase === 'exiting'
              ? `${firstReactionWidgetExit} ${FIRST_REACTION_WIDGET_EXIT_MS}ms ease-in forwards`
              : 'none',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          flex: '0 0 44%',
          minWidth: 0,
          maxWidth: '48%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <FirstReactionWidgetBolt style={style} />
        </Box>
      </Box>
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          flex: '1 1 auto',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: 0.5,
          pl: 0.5,
          pr: 1,
        }}
      >
        <Typography
          component="p"
          sx={{
            m: 0,
            fontSize: 'clamp(0.7rem, 2.4vw, 0.9rem)',
            fontWeight: 600,
            fontFamily: '"Plus Jakarta Sans", Inter, sans-serif',
            color: style.textHint,
            textAlign: 'left',
            lineHeight: 1.25,
            letterSpacing: '0.02em',
            maxWidth: '100%',
          }}
        >
          {hint}
        </Typography>
        <Typography
          component="p"
          sx={{
            m: 0,
            fontSize: 'clamp(1.35rem, 5.5vw, 2.5rem)',
            fontWeight: 800,
            fontFamily: '"Plus Jakarta Sans", Inter, sans-serif',
            color: style.textKeyword,
            textAlign: 'left',
            lineHeight: 1.08,
            letterSpacing: isWinnerFrame ? '0.01em' : '0.03em',
            textTransform: isWinnerFrame ? 'none' : 'uppercase',
            wordBreak: 'break-word',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            maxWidth: '100%',
          }}
          title={headline ?? undefined}
        >
          {headline}
        </Typography>
        {showKeywordSubline ? (
          <Typography
            component="p"
            sx={{
              m: 0,
              fontSize: 'clamp(0.75rem, 2.2vw, 0.95rem)',
              fontWeight: 600,
              fontFamily: '"Plus Jakarta Sans", Inter, sans-serif',
              color: style.textTimer,
              textAlign: 'left',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {keyword}
          </Typography>
        ) : null}
        {timerLabel ? (
          <Typography
            component="p"
            sx={{
              m: 0,
              fontSize: 'clamp(0.95rem, 3.2vw, 1.25rem)',
              fontWeight: 700,
              fontFamily: '"Plus Jakarta Sans", Inter, sans-serif',
              color: style.textTimer,
              textAlign: 'left',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {timerLabel}
          </Typography>
        ) : null}
      </Box>
    </Box>
  )
}
