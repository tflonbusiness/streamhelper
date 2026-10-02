import { Button, Stack } from '@mui/material'
import ArchiveIcon from '@mui/icons-material/Archive'
import DownloadIcon from '@mui/icons-material/Download'
import { styled } from '@mui/material/styles'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { PrizeSpinRecord, PrizeSpinWin } from '@/api/prize-spin'
import { isPrizeSpinReadOnly } from '@/api/prize-spin'
import { prizeSpinHistoryStatusChip } from '@/components/prize-spin/prize-spin-page/prizeSpinHistoryStatusChip'
import { ChatRollSessionIdBadge } from '@/components/chat-roll/session/ChatRollSessionIdBadge'
import {
  StyledCompactSessionCardContent,
  StyledSessionCard,
  StyledSessionHeaderTitle,
  StyledSessionHeaderTitleRow,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { SessionCardInlineNotice } from '@/components/session/SessionCardInlineNotice'
import { SessionHeaderEntitlementNotices } from '@/components/session/SessionHeaderEntitlementNotices'
import type { EntitlementEnvelope } from '@/lib/entitlements'
import { downloadWinnersXlsx } from '@/lib/prize-spin-winners-export'
import { useNotification } from '@/context/NotificationContext'
import { useArchivePrizeSpinSession } from '@/queries/use-prize-spin-session'

type PrizeSpinSessionHeaderSectionProps = {
  accountId: number
  prizeSpinId: number
  record: PrizeSpinRecord
  wins: PrizeSpinWin[]
  onOpenArchiveDialog: () => void
  onGoLive?: () => void
  liveActionPending?: boolean
  goLiveDisabled?: boolean
  envelope?: EntitlementEnvelope
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

const ActionsStack = styled(Stack)(({ theme }) => ({
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.spacing(1),
}))

const ReadOnlyAlert = SessionCardInlineNotice

export const PrizeSpinSessionHeaderSection = (
  props: PrizeSpinSessionHeaderSectionProps,
) => {
  const { t } = useTranslation()
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
      showSuccess(t('prizeSpin.winnersExported'))
    } catch (exportError) {
      showError(
        exportError instanceof Error
          ? exportError.message
          : t('prizeSpin.couldNotExportWinners'),
      )
    } finally {
      setIsExportingWinners(false)
    }
  }

  return (
    <StyledSessionCard elevation={0}>
      <StyledCompactSessionCardContent>
        <HeaderStack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
          <StyledSessionHeaderTitleRow>
            <ChatRollSessionIdBadge sessionId={props.record.id} />
            <StyledSessionHeaderTitle variant="h6" noWrap>
              {props.record.title}
            </StyledSessionHeaderTitle>
            {prizeSpinHistoryStatusChip(props.record, t)}
          </StyledSessionHeaderTitleRow>
          <ActionsStack direction="row">
            <Button
              type="button"
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon fontSize="small" aria-hidden />}
              disabled={props.wins.length === 0 || isExportingWinners}
              onClick={handleDownloadWinners}
            >
              {isExportingWinners ? t('common.downloading') : t('common.downloadHistory')}
            </Button>
            {!readOnly && props.record.status === 'off_air' ? (
              <Button
                type="button"
                variant="contained"
                size="small"
                color="primary"
                disabled={props.liveActionPending || props.goLiveDisabled}
                onClick={props.onGoLive}
              >
                {t('prizeSpin.goLive')}
              </Button>
            ) : null}
            {!readOnly ? (
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<ArchiveIcon fontSize="small" aria-hidden />}
                disabled={actionsPending}
                onClick={props.onOpenArchiveDialog}
              >
                {t('common.archive')}
              </Button>
            ) : null}
          </ActionsStack>
        </HeaderStack>
        <SessionHeaderEntitlementNotices
          envelope={props.envelope}
          module="prizeSpin"
        />
        {readOnly ? (
          <ReadOnlyAlert>{t('prizeSpin.sessionArchivedViewOnly')}</ReadOnlyAlert>
        ) : null}
      </StyledCompactSessionCardContent>
    </StyledSessionCard>
  )
}
