import { Button, Chip, Stack, Typography } from '@mui/material'
import ArchiveIcon from '@mui/icons-material/Archive'
import DownloadIcon from '@mui/icons-material/Download'
import PodcastsIcon from '@mui/icons-material/Podcasts'
import { SquareRounded as SquareRoundedIcon } from '@mui/icons-material'
import { alpha, styled, useTheme } from '@mui/material/styles'
import { useState } from 'react'
import type { PrizeSpinRecord, PrizeSpinWin } from '@/api/prize-spin'
import { isPrizeSpinLive, isPrizeSpinReadOnly } from '@/api/prize-spin'
import { LiveStatusChip } from '@/components/LiveStatusChip'
import {
  StyledCompactSessionCardContent,
  StyledSessionCard,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { StatusAlert } from '@/components/StatusAlert'
import { useNotification } from '@/context/NotificationContext'
import { downloadWinnersXlsx } from '@/lib/prize-spin-winners-export'
import {
  useArchivePrizeSpinSession,
  useDeactivatePrizeSpinSession,
  useGoLivePrizeSpinSession,
} from '@/queries/use-prize-spin-session'
import { mutedChipSx } from '@/theme/colors'

type PrizeSpinSessionHeaderSectionProps = {
  accountId: number
  prizeSpinId: number
  record: PrizeSpinRecord
  wins: PrizeSpinWin[]
  onOpenArchiveDialog: () => void
  onOpenDeactivateDialog: () => void
}

const HeaderStack = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  justifyContent: 'space-between',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.up('lg')]: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}))

const TitleStack = styled(Stack)({
  minWidth: 0,
  alignItems: 'center',
})

const SessionTitle = styled(Typography)({
  fontWeight: 600,
})

const SessionId = styled('span')(({ theme }) => ({
  ...theme.typography.h6,
  fontWeight: 600,
  color: theme.palette.text.secondary,
}))

const ActionsStack = styled(Stack)(({ theme }) => ({
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}))

const OffAirButton = styled(Button)(({ theme }) => ({
  borderColor: alpha(theme.palette.error.main, 0.4),
  color: theme.palette.error.main,
  '&:hover': {
    borderColor: theme.palette.error.main,
    backgroundColor: alpha(theme.palette.error.main, 0.1),
  },
}))

const GoLiveButton = styled(Button)(({ theme }) => ({
  borderColor: alpha(theme.palette.success.main, 0.4),
  color: theme.palette.success.light,
  '&:hover': {
    borderColor: theme.palette.success.main,
    backgroundColor: alpha(theme.palette.success.main, 0.1),
  },
}))

const ArchiveButton = styled(Button)(({ theme }) => ({
  borderColor: alpha(theme.palette.warning.main, 0.4),
  color: theme.palette.warning.main,
  '&:hover': {
    borderColor: theme.palette.warning.main,
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
  },
}))

const ReadOnlyAlert = styled(StatusAlert)(({ theme }) => ({
  marginTop: theme.spacing(2),
}))

export const PrizeSpinSessionHeaderSection = (
  props: PrizeSpinSessionHeaderSectionProps,
) => {
  const theme = useTheme()
  const { showSuccess, showError } = useNotification()
  const [isExportingWinners, setIsExportingWinners] = useState(false)

  const goLiveMutation = useGoLivePrizeSpinSession(
    props.accountId,
    props.prizeSpinId,
  )
  const deactivateMutation = useDeactivatePrizeSpinSession(
    props.accountId,
    props.prizeSpinId,
  )
  const archiveSessionMutation = useArchivePrizeSpinSession(
    props.accountId,
    props.prizeSpinId,
  )

  const readOnly = isPrizeSpinReadOnly(props.record)
  const isLive = isPrizeSpinLive(props.record)
  const actionsPending =
    archiveSessionMutation.isPending ||
    deactivateMutation.isPending ||
    goLiveMutation.isPending

  const handleDownloadWinners = () => {
    if (props.wins.length === 0 || isExportingWinners) {
      return
    }

    setIsExportingWinners(true)

    try {
      downloadWinnersXlsx(props.wins, props.prizeSpinId)
      showSuccess('Winners exported.')
    } catch (exportError) {
      showError(
        exportError instanceof Error
          ? exportError.message
          : 'Could not export winners',
      )
    } finally {
      setIsExportingWinners(false)
    }
  }

  const handleGoLive = () => {
    goLiveMutation.mutate(undefined, {
      onSuccess: () => showSuccess('Session is now live.'),
      onError: (error) => {
        showError(
          error instanceof Error ? error.message : 'Could not go live',
        )
      },
    })
  }

  return (
    <StyledSessionCard elevation={0}>
      <StyledCompactSessionCardContent>
        <HeaderStack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
          <TitleStack direction="row" spacing={1}>
            <SessionTitle variant="h6" noWrap>
              {props.record.title} <SessionId>#{props.record.id}</SessionId>
            </SessionTitle>
            {isLive ? <LiveStatusChip /> : null}
            {readOnly ? (
              <Chip label="Archived" size="small" sx={mutedChipSx(theme)} />
            ) : null}
          </TitleStack>
          <ActionsStack direction="row">
            <Button
              type="button"
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon fontSize="small" aria-hidden />}
              disabled={props.wins.length === 0 || isExportingWinners}
              onClick={handleDownloadWinners}
            >
              {isExportingWinners ? 'Downloading…' : 'Download History'}
            </Button>
            {!readOnly && isLive ? (
              <OffAirButton
                type="button"
                variant="outlined"
                size="small"
                startIcon={
                  <SquareRoundedIcon sx={{ fontSize: 16 }} aria-hidden />
                }
                disabled={deactivateMutation.isPending}
                onClick={props.onOpenDeactivateDialog}
              >
                Off Air
              </OffAirButton>
            ) : null}
            {!readOnly && !isLive ? (
              <GoLiveButton
                type="button"
                variant="outlined"
                size="small"
                startIcon={<PodcastsIcon fontSize="small" aria-hidden />}
                disabled={goLiveMutation.isPending}
                onClick={() => void handleGoLive()}
              >
                {goLiveMutation.isPending ? 'Going live…' : 'Go live'}
              </GoLiveButton>
            ) : null}
            {!readOnly ? (
              <ArchiveButton
                type="button"
                variant="outlined"
                size="small"
                startIcon={<ArchiveIcon fontSize="small" aria-hidden />}
                disabled={actionsPending}
                onClick={props.onOpenArchiveDialog}
              >
                Archive
              </ArchiveButton>
            ) : null}
          </ActionsStack>
        </HeaderStack>
        {readOnly ? (
          <ReadOnlyAlert tone="info">
            This session is archived. View only.
          </ReadOnlyAlert>
        ) : null}
      </StyledCompactSessionCardContent>
    </StyledSessionCard>
  )
}
