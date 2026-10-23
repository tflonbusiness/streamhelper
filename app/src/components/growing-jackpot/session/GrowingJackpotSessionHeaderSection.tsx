import { Button, Stack } from '@mui/material'
import ArchiveIcon from '@mui/icons-material/Archive'
import EditIcon from '@mui/icons-material/Edit'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import type { GrowingJackpotRecord } from '@/api/growing-jackpot'
import { isGrowingJackpotReadOnly } from '@/api/growing-jackpot'
import { growingJackpotHistoryStatusChip } from '@/components/growing-jackpot/growing-jackpot-page/growingJackpotHistoryStatusChip'
import { ChatRollSessionIdBadge } from '@/components/chat-roll/session/ChatRollSessionIdBadge'
import {
  StyledCompactSessionCardContent,
  StyledSessionCard,
  StyledSessionHeaderTitle,
  StyledSessionHeaderTitleRow,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { SessionCardInlineNotice } from '@/components/session/SessionCardInlineNotice'

type GrowingJackpotSessionHeaderSectionProps = {
  record: GrowingJackpotRecord
  onOpenArchiveDialog: () => void
  onOpenEditDialog: () => void
  onGoLive?: () => void
  liveActionPending?: boolean
  goLiveDisabled?: boolean
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

export function GrowingJackpotSessionHeaderSection(
  props: GrowingJackpotSessionHeaderSectionProps,
) {
  const { t } = useTranslation()
  const readOnly = isGrowingJackpotReadOnly(props.record)

  return (
    <StyledSessionCard elevation={0}>
      <StyledCompactSessionCardContent>
        {readOnly ? (
          <SessionCardInlineNotice severity="info" sx={{ mb: 2 }}>
            {t('growingJackpot.sessionArchivedViewOnly')}
          </SessionCardInlineNotice>
        ) : null}
        <HeaderStack>
          <StyledSessionHeaderTitleRow>
            <ChatRollSessionIdBadge sessionId={props.record.id} />
            <StyledSessionHeaderTitle variant="h6" noWrap>
              {props.record.title}
            </StyledSessionHeaderTitle>
            {growingJackpotHistoryStatusChip(props.record, t)}
          </StyledSessionHeaderTitleRow>
          <ActionsStack direction="row">
            {!readOnly && props.record.status === 'off_air' ? (
              <Button
                type="button"
                variant="contained"
                size="small"
                color="primary"
                data-testid="growing-jackpot-session-go-live"
                disabled={props.liveActionPending || props.goLiveDisabled}
                onClick={props.onGoLive}
              >
                {t('growingJackpot.goLive')}
              </Button>
            ) : null}
            {!readOnly ? (
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<ArchiveIcon fontSize="small" aria-hidden />}
                onClick={props.onOpenArchiveDialog}
              >
                {t('common.archive')}
              </Button>
            ) : null}
            {!readOnly ? (
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<EditIcon fontSize="small" aria-hidden />}
                onClick={props.onOpenEditDialog}
              >
                {t('common.edit')}
              </Button>
            ) : null}
          </ActionsStack>
        </HeaderStack>
      </StyledCompactSessionCardContent>
    </StyledSessionCard>
  )
}
