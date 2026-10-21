import { Box, Typography } from '@mui/material'
import type { PublicFirstReactionWidgetView } from '@/api/first-reaction'
import { FirstReactionWidgetBolt } from '@/components/first-reaction/widget/FirstReactionWidgetBolt'
import { useFirstReactionAcceptTimer } from '@/hooks/use-first-reaction-accept-timer'
import { widgetUiCopy } from '@/i18n/widget-ui'
import { FIRST_REACTION_WIDGET_STYLE_DEFAULTS } from '@/lib/first-reaction-widget-style-defaults'

type FirstReactionWidgetCardProps = {
  view: PublicFirstReactionWidgetView & { status: 'active' }
  width: number
  height: number
}

export function FirstReactionWidgetCard({
  view,
  width,
  height,
}: FirstReactionWidgetCardProps) {
  const isAccepting = view.phase === 'accepting' && view.keyword
  const style = view.style ?? FIRST_REACTION_WIDGET_STYLE_DEFAULTS

  const timer = useFirstReactionAcceptTimer(
    isAccepting ? view.acceptDeadlineAt : null,
    isAccepting ? view.acceptingStartedAt : null,
  )

  if (!isAccepting) {
    return <Box aria-hidden sx={{ width, height, bgcolor: 'transparent' }} />
  }

  const keyword = view.keyword!
  const timerLabel =
    timer.secondsLeft !== null && view.acceptDeadlineAt
      ? widgetUiCopy.firstReactionSecondsLeft.replace(
          '{{seconds}}',
          String(timer.secondsLeft),
        )
      : null

  const hint = widgetUiCopy.firstReactionCta
  const ariaLabel = timerLabel
    ? `${hint}. ${keyword}. ${timerLabel}`
    : `${hint}. ${keyword}`

  return (
    <Box
      role="status"
      aria-label={ariaLabel}
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
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            wordBreak: 'break-word',
            maxWidth: '100%',
          }}
        >
          {keyword}
        </Typography>
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
