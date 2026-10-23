import SensorsIcon from '@mui/icons-material/Sensors'
import {
  Button,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import type { GrowingJackpotRound } from '@/api/growing-jackpot'
import {
  StyledSessionCard,
  StyledSessionCardContent,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { SectionHeader } from '@/components/SectionHeader'
import { useGrowingJackpotRoundTimer } from '@/hooks/use-growing-jackpot-round-timer'

type GrowingJackpotRoundSectionProps = {
  isLive: boolean
  readOnly: boolean
  activeRound: GrowingJackpotRound | null
  startPending: boolean
  stopPending: boolean
  onStart: () => void
  onStop: () => void
}

const CommandDisplay = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  fontVariantNumeric: 'tabular-nums',
  color: theme.palette.text.primary,
}))

const ActionsRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}))

export function GrowingJackpotRoundSection(
  props: GrowingJackpotRoundSectionProps,
) {
  const { t } = useTranslation()
  const isAccepting = props.activeRound?.phase === 'accepting'
  const timer = useGrowingJackpotRoundTimer(
    isAccepting && props.activeRound ? props.activeRound.endsAt : null,
    isAccepting && props.activeRound ? props.activeRound.createdAt : null,
  )

  return (
    <StyledSessionCard elevation={0}>
      <StyledSessionCardContent>
        <Stack spacing={2.5}>
          <SectionHeader
            title={t('growingJackpot.roundTitle')}
            description={t('growingJackpot.roundDescription')}
            icon={SensorsIcon}
            iconVariant="warning"
            showDivider={false}
          />
          {!props.isLive ? (
            <Typography variant="body2" color="text.secondary">
              {t('growingJackpot.goLiveToStartRound')}
            </Typography>
          ) : null}
          {isAccepting && props.activeRound ? (
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                {t('growingJackpot.joinKeywordLabel')}
              </Typography>
              <CommandDisplay data-testid="growing-jackpot-join-keyword">
                {props.activeRound.joinKeyword}
              </CommandDisplay>
              <Typography variant="body2" color="text.secondary">
                {t('growingJackpot.participantCount', {
                  count: props.activeRound.participantCount,
                })}
                {' · '}
                {t('growingJackpot.displayPrize', {
                  value: props.activeRound.displayPrize,
                })}
              </Typography>
              {timer.secondsLeft !== null ? (
                <Stack spacing={0.75} sx={{ pt: 0.5, maxWidth: 320 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.round((timer.progress ?? 0) * 100)}
                    color={timer.urgent ? 'warning' : 'primary'}
                    aria-hidden
                  />
                  <Typography
                    variant="body2"
                    color={timer.urgent ? 'warning.main' : 'text.secondary'}
                    fontWeight={timer.urgent ? 700 : 500}
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {t('growingJackpot.secondsLeft', {
                      seconds: timer.secondsLeft,
                    })}
                  </Typography>
                </Stack>
              ) : null}
            </Stack>
          ) : null}
          <ActionsRow>
            {!isAccepting ? (
              <Button
                variant="contained"
                data-testid="growing-jackpot-start-round"
                disabled={
                  props.readOnly ||
                  !props.isLive ||
                  props.startPending
                }
                onClick={props.onStart}
              >
                {t('growingJackpot.startRound')}
              </Button>
            ) : (
              <Button
                color="warning"
                data-testid="growing-jackpot-stop-round"
                disabled={props.readOnly || props.stopPending}
                onClick={props.onStop}
              >
                {t('growingJackpot.stopRound')}
              </Button>
            )}
          </ActionsRow>
        </Stack>
      </StyledSessionCardContent>
    </StyledSessionCard>
  )
}
