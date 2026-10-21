import { Button, Stack } from '@mui/material'
import ArchiveIcon from '@mui/icons-material/Archive'
import EditIcon from '@mui/icons-material/Edit'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import type { FirstReactionRecord } from '@/api/first-reaction'
import { isFirstReactionReadOnly } from '@/api/first-reaction'
import { firstReactionHistoryStatusChip } from '@/components/first-reaction/first-reaction-page/firstReactionHistoryStatusChip'
import { ChatRollSessionIdBadge } from '@/components/chat-roll/session/ChatRollSessionIdBadge'
import {
  StyledCompactSessionCardContent,
  StyledSessionCard,
  StyledSessionHeaderTitle,
  StyledSessionHeaderTitleRow,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { SessionCardInlineNotice } from '@/components/session/SessionCardInlineNotice'
import { useDeactivateFirstReaction } from '@/queries/use-first-reaction-session'

type FirstReactionSessionHeaderSectionProps = {
  accountId: number
  firstReactionId: number
  record: FirstReactionRecord
  onOpenArchiveDialog: () => void
  onOpenEditDialog?: () => void
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

export function FirstReactionSessionHeaderSection(
  props: FirstReactionSessionHeaderSectionProps,
) {
  const { t } = useTranslation()
  const deactivateMutation = useDeactivateFirstReaction(
    props.accountId,
    props.firstReactionId,
  )
  const readOnly = isFirstReactionReadOnly(props.record)

  return (
    <StyledSessionCard elevation={0}>
      <StyledCompactSessionCardContent>
        {readOnly ? (
          <SessionCardInlineNotice severity="info" sx={{ mb: 2 }}>
            {t('firstReaction.sessionArchivedViewOnly')}
          </SessionCardInlineNotice>
        ) : null}
        <HeaderStack>
          <StyledSessionHeaderTitleRow>
            <ChatRollSessionIdBadge sessionId={props.record.id} />
            <StyledSessionHeaderTitle variant="h6" noWrap>
              {props.record.title}
            </StyledSessionHeaderTitle>
            {firstReactionHistoryStatusChip(props.record, t)}
          </StyledSessionHeaderTitleRow>
          <ActionsStack direction="row">
            {!readOnly && props.record.status === 'off_air' ? (
              <Button
                type="button"
                variant="contained"
                size="small"
                disabled={props.liveActionPending || props.goLiveDisabled}
                onClick={props.onGoLive}
              >
                {t('firstReaction.goLive')}
              </Button>
            ) : null}
            {!readOnly && props.record.status === 'live' ? (
              <Button
                type="button"
                variant="outlined"
                size="small"
                disabled={deactivateMutation.isPending}
                onClick={() => deactivateMutation.mutate()}
              >
                {t('firstReaction.offAir')}
              </Button>
            ) : null}
            {!readOnly && props.onOpenEditDialog ? (
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
            {!readOnly ? (
              <Button
                type="button"
                variant="outlined"
                size="small"
                color="inherit"
                startIcon={<ArchiveIcon fontSize="small" aria-hidden />}
                onClick={props.onOpenArchiveDialog}
              >
                {t('table.archive')}
              </Button>
            ) : null}
          </ActionsStack>
        </HeaderStack>
      </StyledCompactSessionCardContent>
    </StyledSessionCard>
  )
}
