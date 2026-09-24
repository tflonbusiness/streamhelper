import { Button, Chip, Stack, Typography } from '@mui/material'
import ArchiveIcon from '@mui/icons-material/Archive'
import DownloadIcon from '@mui/icons-material/Download'
import { styled, useTheme } from '@mui/material/styles'
import { useState } from 'react'
import type { PrizeSpinRecord, PrizeSpinWin } from '@/api/prize-spin'
import { isPrizeSpinReadOnly } from '@/api/prize-spin'
import {
  StyledCompactSessionCardContent,
  StyledSessionCard,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { StatusAlert } from '@/components/StatusAlert'
import { useNotification } from '@/context/NotificationContext'
import { downloadWinnersXlsx } from '@/lib/prize-spin-winners-export'
import { useArchivePrizeSpinSession } from '@/queries/use-prize-spin-session'
import { mutedChipSx } from '@/theme/colors'

type PrizeSpinSessionHeaderSectionProps = {
  accountId: number
  prizeSpinId: number
  record: PrizeSpinRecord
  wins: PrizeSpinWin[]
  onOpenArchiveDialog: () => void
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

const ReadOnlyAlert = styled(StatusAlert)(({ theme }) => ({
  marginTop: theme.spacing(2),
}))

export const PrizeSpinSessionHeaderSection = (
  props: PrizeSpinSessionHeaderSectionProps,
) => {
  const theme = useTheme()
  const { showSuccess, showError } = useNotification()
  const [isExportingWinners, setIsExportingWinners] = useState(false)

  const archiveSessionMutation = useArchivePrizeSpinSession(
    props.accountId,
    props.prizeSpinId,
  )

  const readOnly = isPrizeSpinReadOnly(props.record)
  const actionsPending = archiveSessionMutation.isPending

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

  return (
    <StyledSessionCard elevation={0}>
      <StyledCompactSessionCardContent>
        <HeaderStack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
          <TitleStack direction="row" spacing={1}>
            <SessionTitle variant="h6" noWrap>
              {props.record.title} <SessionId>#{props.record.id}</SessionId>
            </SessionTitle>
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
            {!readOnly ? (
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<ArchiveIcon fontSize="small" aria-hidden />}
                disabled={actionsPending}
                onClick={props.onOpenArchiveDialog}
              >
                Archive
              </Button>
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
