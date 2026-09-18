import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import { styled } from '@mui/material/styles'
import { useMemo, useState } from 'react'
import type { PrizeSpinSector } from '@/api/prize-spin'
import { IconTile } from '@/components/IconTile'
import {
  isCompleteWinPercentTotal,
  sumWinPercent,
} from '@/components/prize-spin/session/prize-spin-session-utils'
import {
  StyledSectionDivider,
  StyledSessionCard,
  StyledSessionCardContent,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { StatusAlert, type StatusAlertTone } from '@/components/StatusAlert'
import { useNotification } from '@/context/NotificationContext'
import { validateParticipantNick } from '@/lib/prize-spin-validation'
import { useSpinPrizeSpin } from '@/queries/use-prize-spin-session'

type PrizeSpinSessionSpinSectionProps = {
  accountId: number
  prizeSpinId: number
  sectors: PrizeSpinSector[]
  readOnly: boolean
}

const SectionTitleRow = styled(Stack)({
  alignItems: 'center',
})

const SectionTitle = styled(Typography)({
  fontWeight: 600,
})

const SpinControls = styled(Stack)(({ theme }) => ({
  alignItems: 'flex-start',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
  },
}))

const ParticipantField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
}))

const SpinButton = styled(Button)(({ theme }) => ({
  flexShrink: 0,
  minWidth: 120,
  [theme.breakpoints.up('sm')]: {
    minWidth: 120,
  },
}))

const ReadinessAlert = styled(StatusAlert)(({ theme }) => ({
  marginTop: theme.spacing(2),
}))

const SpinErrorAlert = styled(StatusAlert)(({ theme }) => ({
  marginTop: theme.spacing(2),
}))

export const PrizeSpinSessionSpinSection = (
  props: PrizeSpinSessionSpinSectionProps,
) => {
  const { showSuccess, showError } = useNotification()
  const [participantNick, setParticipantNick] = useState('')
  const [spinError, setSpinError] = useState<string | null>(null)

  const spinMutation = useSpinPrizeSpin(props.accountId, props.prizeSpinId)
  const isSpinning = spinMutation.isPending

  const totalWinPercent = useMemo(
    () => sumWinPercent(props.sectors),
    [props.sectors],
  )
  const isWinPercentComplete = isCompleteWinPercentTotal(totalWinPercent)

  const canSpin =
    !props.readOnly &&
    participantNick.trim().length > 0 &&
    props.sectors.length >= 2 &&
    isWinPercentComplete &&
    !isSpinning

  const spinReadiness = useMemo(() => {
    const messages: string[] = []

    if (isSpinning) {
      messages.push('Spin in progress…')
    }
    if (participantNick.trim().length === 0) {
      messages.push('Enter a participant nick to enable spin.')
    }
    if (props.sectors.length < 2) {
      messages.push('Add at least 2 wheel sectors before spinning.')
    }
    if (!isCompleteWinPercentTotal(totalWinPercent)) {
      messages.push('Sector win percentages must total 100% before spinning.')
    }

    if (messages.length === 0) {
      return {
        tone: 'success' as const,
        messages: ['Ready to spin for this viewer.'],
      }
    }

    const hasValidationIssue =
      participantNick.trim().length === 0 ||
      props.sectors.length < 2 ||
      !isCompleteWinPercentTotal(totalWinPercent)
    const tone: StatusAlertTone = hasValidationIssue ? 'warning' : 'info'

    return { tone, messages }
  }, [isSpinning, participantNick, props.sectors.length, totalWinPercent])

  const handleSpin = async () => {
    if (isSpinning) {
      return
    }

    const nickError = validateParticipantNick(participantNick)
    if (nickError) {
      setSpinError(nickError)
      return
    }
    if (!canSpin) {
      return
    }

    setSpinError(null)

    try {
      const win = await spinMutation.mutateAsync(participantNick.trim())
      setParticipantNick('')
      showSuccess(`Winner: ${win.participantNick} — ${win.sectorLabel}`)
    } catch (spinFailure) {
      const message =
        spinFailure instanceof Error
          ? spinFailure.message
          : 'Could not spin prize wheel'
      setSpinError(message)
      showError(message)
    }
  }

  return (
    <StyledSessionCard elevation={0}>
      <StyledSessionCardContent>
        <SectionTitleRow direction="row" spacing={1.5}>
          <IconTile icon={PersonIcon} variant="purple" size="sm" />
          <SectionTitle variant="h6">Spin For Viewer</SectionTitle>
        </SectionTitleRow>
        <StyledSectionDivider />
        <SpinControls direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <ParticipantField
            label="Participant nick"
            placeholder="Viewer chat nick"
            value={participantNick}
            onChange={(event) => setParticipantNick(event.target.value)}
            disabled={props.readOnly}
            fullWidth
            size="small"
          />
          <SpinButton
            type="button"
            variant="contained"
            disabled={!canSpin}
            onClick={() => void handleSpin()}
          >
            {isSpinning ? 'Spinning…' : 'Spin'}
          </SpinButton>
        </SpinControls>
        <ReadinessAlert tone={spinReadiness.tone}>
          {spinReadiness.messages.length === 1 ? (
            spinReadiness.messages[0]
          ) : (
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {spinReadiness.messages.map((message) => (
                <Typography component="li" variant="body2" key={message}>
                  {message}
                </Typography>
              ))}
            </Box>
          )}
        </ReadinessAlert>
        {spinError ? (
          <SpinErrorAlert tone="error">{spinError}</SpinErrorAlert>
        ) : null}
      </StyledSessionCardContent>
    </StyledSessionCard>
  )
}
