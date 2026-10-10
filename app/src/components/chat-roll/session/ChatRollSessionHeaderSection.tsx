import { Box, Button, Stack } from '@mui/material'
import type { ReactNode } from 'react'
import ArchiveIcon from '@mui/icons-material/Archive'
import EditIcon from '@mui/icons-material/Edit'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import type { ChatRollRecord } from '@/api/chat-roll'
import { isChatRollReadOnly } from '@/api/chat-roll'
import {
  StyledCompactSessionCardContent,
  StyledSessionBadgeGroup,
  StyledSessionCard,
  StyledSessionHeaderTitle,
  StyledSessionHeaderTitleRow,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { SessionCardInlineNotice } from '@/components/session/SessionCardInlineNotice'
import { ChatRollLiveStatusChip } from '@/components/chat-roll/ChatRollLiveStatusChip'
import { ChatRollSessionIdBadge } from '@/components/chat-roll/session/ChatRollSessionIdBadge'
import {
  MutedStatusChip,
  StatusToneChip,
  statusBadgeColors,
} from '@/components/StatusToneChip'

type ChatRollSessionHeaderSectionProps = {
  record: ChatRollRecord
  onOpenArchiveDialog: () => void
  onOpenEditDialog: () => void
  onGoLive?: () => void
  liveActionPending?: boolean
  goLiveDisabled?: boolean
  primaryActions?: ReactNode
  centerAction?: ReactNode
}

const HeaderLayout = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'hasCenterAction',
})<{ hasCenterAction?: boolean }>(({ theme, hasCenterAction }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  alignItems: 'center',
  gridTemplateColumns: '1fr',
  gridTemplateAreas: hasCenterAction
    ? `
    "title"
    "center"
    "actions"
  `
    : `
    "title"
    "actions"
  `,
  [theme.breakpoints.up('lg')]: hasCenterAction
    ? {
        gridTemplateColumns: '1fr auto 1fr',
        gridTemplateAreas: '"title center actions"',
      }
    : {
        gridTemplateColumns: '1fr auto',
        gridTemplateAreas: '"title actions"',
      },
}))

const TitleArea = styled(Box)({
  gridArea: 'title',
  minWidth: 0,
})

const CenterActionArea = styled(Box)(({ theme }) => ({
  gridArea: 'center',
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  [theme.breakpoints.up('lg')]: {
    width: 'auto',
    justifySelf: 'center',
  },
}))

const ActionsArea = styled(Box)(({ theme }) => ({
  gridArea: 'actions',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: theme.spacing(1),
  [theme.breakpoints.up('lg')]: {
    justifyContent: 'flex-end',
  },
}))

const ActionsStack = styled(Stack)(({ theme }) => ({
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.spacing(1),
}))

const ReadOnlyAlert = SessionCardInlineNotice

export const ChatRollSessionHeaderSection = (
  props: ChatRollSessionHeaderSectionProps,
) => {
  const { t } = useTranslation()
  const readOnly = isChatRollReadOnly(props.record)

  return (
    <StyledSessionCard elevation={0}>
      <StyledCompactSessionCardContent>
        <HeaderLayout hasCenterAction={Boolean(props.centerAction)}>
          <TitleArea>
            <StyledSessionHeaderTitleRow>
              <ChatRollSessionIdBadge sessionId={props.record.id} />
              <StyledSessionHeaderTitle variant="h6" noWrap>
                {props.record.title}
              </StyledSessionHeaderTitle>
              <StyledSessionBadgeGroup>
                {readOnly ? (
                  <MutedStatusChip label={t('common.archived')} />
                ) : null}
                {!readOnly && props.record.status === 'live' ? (
                  <ChatRollLiveStatusChip />
                ) : null}
                {!readOnly &&
                props.record.status === 'live' &&
                props.record.isAcceptingParticipants ? (
                  <StatusToneChip
                    label={t('chatRoll.entriesOpen')}
                    color={statusBadgeColors.open}
                  />
                ) : null}
                {!readOnly &&
                props.record.status === 'live' &&
                !props.record.isAcceptingParticipants ? (
                  <StatusToneChip
                    label={t('chatRoll.entriesPaused')}
                    color={statusBadgeColors.paused}
                  />
                ) : null}
              </StyledSessionBadgeGroup>
            </StyledSessionHeaderTitleRow>
          </TitleArea>
          {props.centerAction ? (
            <CenterActionArea>{props.centerAction}</CenterActionArea>
          ) : null}
          <ActionsArea>
            <ActionsStack direction="row">
              {props.primaryActions}
              {!readOnly && props.record.status === 'off_air' ? (
                <Button
                  type="button"
                  variant="contained"
                  size="small"
                  color="primary"
                  disabled={props.liveActionPending || props.goLiveDisabled}
                  onClick={props.onGoLive}
                >
                  {t('chatRoll.goLive')}
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
          </ActionsArea>
        </HeaderLayout>
        {readOnly ? (
          <ReadOnlyAlert>{t('chatRoll.sessionArchivedViewOnly')}</ReadOnlyAlert>
        ) : null}
      </StyledCompactSessionCardContent>
    </StyledSessionCard>
  )
}
