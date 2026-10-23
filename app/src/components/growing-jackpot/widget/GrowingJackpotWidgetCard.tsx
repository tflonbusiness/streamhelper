import { Box, LinearProgress, Stack, Typography } from '@mui/material'
import type {
  GrowingJackpotWidgetStyle,
  PublicGrowingJackpotWidget,
} from '@/api/growing-jackpot'
import { useGrowingJackpotRoundTimer } from '@/hooks/use-growing-jackpot-round-timer'
import { widgetUiCopy } from '@/i18n/widget-ui'
import { GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS } from '@/lib/growing-jackpot-widget-style-defaults'

type GrowingJackpotWidgetCardProps = {
  view: PublicGrowingJackpotWidget
  width: number
  height: number
}

function resolveStyle(view: PublicGrowingJackpotWidget): GrowingJackpotWidgetStyle {
  if (view.status === 'unavailable') {
    return GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS
  }
  return view.style ?? GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS
}

function formatPrize(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

export function GrowingJackpotWidgetCard(props: GrowingJackpotWidgetCardProps) {
  const scale = Math.min(props.width, props.height) / 500
  const style = resolveStyle(props.view)
  const acceptingEndsAt =
    props.view.status === 'accepting' ? props.view.round.endsAt : null
  const acceptingStartedAt =
    props.view.status === 'accepting' ? props.view.round.createdAt : null
  const timer = useGrowingJackpotRoundTimer(
    acceptingEndsAt,
    acceptingStartedAt,
  )

  if (props.view.status === 'idle') {
    return (
      <Box
        sx={{
          width: props.width,
          height: props.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            color: style.prizeTextDim,
            fontSize: 18 * scale,
            fontWeight: 600,
            textShadow: '0 2px 8px rgba(0,0,0,0.9)',
          }}
        >
          {widgetUiCopy.growingJackpotIdle}
        </Typography>
      </Box>
    )
  }

  if (props.view.status === 'unavailable') {
    return (
      <Box sx={{ width: props.width, height: props.height, p: 2 }}>
        <Typography color="text.secondary">
          {widgetUiCopy.subscriptionExpired}
        </Typography>
      </Box>
    )
  }

  const round =
    props.view.status === 'accepting' ||
    props.view.status === 'winner' ||
    props.view.status === 'no_participants'
      ? props.view.round
      : null

  if (!round) {
    return null
  }

  if (props.view.status === 'winner') {
    return (
      <Box
        sx={{
          width: props.width,
          height: props.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Stack spacing={1} sx={{ alignItems: 'center' }}>
          <Typography
            sx={{
              color: style.prizeText,
              fontSize: 28 * scale,
              fontWeight: 800,
              textShadow: '0 2px 12px rgba(0,0,0,0.9)',
            }}
          >
            {widgetUiCopy.growingJackpotWinner}
          </Typography>
          <Typography
            sx={{
              color: style.keywordText,
              fontSize: 36 * scale,
              fontWeight: 800,
              textShadow: '0 2px 12px rgba(0,0,0,0.9)',
            }}
          >
            {round.winnerDisplayName ?? '—'}
          </Typography>
          {round.proofToken ? (
            <Typography
              sx={{
                color: style.prizeTextDim,
                fontSize: 14 * scale,
                fontWeight: 600,
              }}
            >
              {round.proofToken}
            </Typography>
          ) : null}
        </Stack>
      </Box>
    )
  }

  if (props.view.status === 'no_participants') {
    return (
      <Box
        sx={{
          width: props.width,
          height: props.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            color: style.prizeTextDim,
            fontSize: 22 * scale,
            fontWeight: 700,
            textShadow: '0 2px 8px rgba(0,0,0,0.9)',
          }}
        >
          {widgetUiCopy.growingJackpotNoParticipants}
        </Typography>
      </Box>
    )
  }

  const keyword =
    props.view.status === 'accepting' ? props.view.joinKeyword : round.joinKeyword

  return (
    <Box
      sx={{
        width: props.width,
        height: props.height,
        boxSizing: 'border-box',
        px: `${20 * scale}px`,
        py: `${16 * scale}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: `${12 * scale}px`,
      }}
    >
      <Typography
        sx={{
          color: style.prizeText,
          fontSize: 20 * scale,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          textShadow: '0 2px 8px rgba(0,0,0,0.9)',
        }}
      >
        {widgetUiCopy.growingJackpotTitle}
      </Typography>
      <Typography
        sx={{
          color: style.keywordText,
          fontSize: 32 * scale,
          fontWeight: 800,
          textShadow: '0 2px 12px rgba(0,0,0,0.9)',
        }}
      >
        {keyword}
      </Typography>
      <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
        <Stat
          label={widgetUiCopy.growingJackpotPlayers}
          value={String(round.participantCount)}
          scale={scale}
          dimColor={style.prizeTextDim}
          valueColor={style.keywordText}
        />
        <Stat
          label={widgetUiCopy.growingJackpotPrize}
          value={formatPrize(round.displayPrize)}
          scale={scale}
          dimColor={style.prizeTextDim}
          valueColor={style.keywordText}
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
      {timer.progress !== null ? (
        <LinearProgress
          variant="determinate"
          value={Math.round(timer.progress * 100)}
          sx={{
            maxWidth: 320,
            height: 6 * scale,
            borderRadius: 1,
            bgcolor: 'rgba(255,255,255,0.15)',
            '& .MuiLinearProgress-bar': { bgcolor: style.prizeText },
          }}
        />
      ) : null}
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
          fontSize: 12 * props.scale,
          fontWeight: 600,
          textTransform: 'uppercase',
        }}
      >
        {props.label}
      </Typography>
      <Typography
        sx={{
          color: props.valueColor,
          fontSize: 28 * props.scale,
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
          textShadow: '0 2px 8px rgba(0,0,0,0.9)',
        }}
      >
        {props.value}
      </Typography>
    </Stack>
  )
}
