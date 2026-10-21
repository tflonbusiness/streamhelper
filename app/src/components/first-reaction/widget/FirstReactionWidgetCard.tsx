import { Box, Typography } from '@mui/material'
import type { PublicFirstReactionWidgetView } from '@/api/first-reaction'
import { FirstReactionWidgetBolt } from '@/components/first-reaction/widget/FirstReactionWidgetBolt'
import { useFirstReactionAcceptTimer } from '@/hooks/use-first-reaction-accept-timer'
import { widgetUiCopy } from '@/i18n/widget-ui'

type FirstReactionWidgetCardProps = {
  view: PublicFirstReactionWidgetView & { status: 'active' }
  width: number
  height: number
}

/**
 * Stream overlay body — design TBD. Shows keyword + timer while accepting.
 */
export function FirstReactionWidgetCard({
  view,
  width,
  height,
}: FirstReactionWidgetCardProps) {
  const isAccepting = view.phase === 'accepting' && view.keyword

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

  const ariaLabel = timerLabel ? `${keyword}, ${timerLabel}` : keyword

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
      }}
    >
      <FirstReactionWidgetBolt />
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          px: 2,
        }}
      >
        <Typography
          component="p"
          sx={{
            m: 0,
            fontSize: 48,
            fontWeight: 800,
            fontFamily: '"Plus Jakarta Sans", Inter, sans-serif',
            color: '#fff',
            textAlign: 'center',
            lineHeight: 1.1,
            wordBreak: 'break-word',
          }}
        >
          {keyword}
        </Typography>
        {timerLabel ? (
          <Typography
            component="p"
            sx={{
              m: 0,
              fontSize: 24,
              fontWeight: 600,
              fontFamily: '"Plus Jakarta Sans", Inter, sans-serif',
              color: 'rgba(255, 255, 255, 0.92)',
              textAlign: 'center',
            }}
          >
            {timerLabel}
          </Typography>
        ) : null}
      </Box>
    </Box>
  )
}
