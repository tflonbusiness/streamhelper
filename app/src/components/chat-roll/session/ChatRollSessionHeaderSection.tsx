import { Button, Chip, Stack } from '@mui/material'
import type { ReactNode } from 'react'
import ArchiveIcon from '@mui/icons-material/Archive'
import { styled, useTheme } from '@mui/material/styles'
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
import { StatusAlert } from '@/components/StatusAlert'
import { ChatRollLiveStatusChip } from '@/components/chat-roll/ChatRollLiveStatusChip'
import { ChatRollSessionIdBadge } from '@/components/chat-roll/session/ChatRollSessionIdBadge'
import { mutedChipSx } from '@/theme/colors'

type ChatRollSessionHeaderSectionProps = {
  record: ChatRollRecord
  onOpenArchiveDialog: () => void
  onGoLive?: () => void
  liveActionPending?: boolean
  primaryActions?: ReactNode
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

const ReadOnlyAlert = styled(StatusAlert)(({ theme }) => ({
  marginTop: theme.spacing(2),
}))

export const ChatRollSessionHeaderSection = (
  props: ChatRollSessionHeaderSectionProps,
) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const readOnly = isChatRollReadOnly(props.record)

  return (
    <StyledSessionCard elevation={0}>
      <StyledCompactSessionCardContent>
        <HeaderStack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
          <StyledSessionHeaderTitleRow>
            <ChatRollSessionIdBadge sessionId={props.record.id} />
            <StyledSessionHeaderTitle variant="h6" noWrap>
              {props.record.title}
            </StyledSessionHeaderTitle>
            <StyledSessionBadgeGroup>
              {readOnly ? (
                <Chip
                  label={t('common.archived')}
                  size="small"
                  sx={mutedChipSx(theme)}
                />
              ) : null}
              {!readOnly && props.record.status === 'live' ? (
                <ChatRollLiveStatusChip />
              ) : null}
              {!readOnly &&
              props.record.status === 'live' &&
              props.record.isAcceptingParticipants ? (
                <Chip
                  label={t('chatRoll.entriesOpen')}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              ) : null}
              {!readOnly &&
              props.record.status === 'live' &&
              !props.record.isAcceptingParticipants ? (
                <Chip
                  label={t('chatRoll.entriesPaused')}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              ) : null}
            </StyledSessionBadgeGroup>
          </StyledSessionHeaderTitleRow>
          <ActionsStack direction="row">
            {props.primaryActions}
            {!readOnly && props.record.status === 'off_air' ? (
              <Button
                type="button"
                variant="contained"
                size="small"
                color="primary"
                disabled={props.liveActionPending}
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
          </ActionsStack>
        </HeaderStack>
        {readOnly ? (
          <ReadOnlyAlert tone="info">
            {t('chatRoll.sessionArchivedViewOnly')}
          </ReadOnlyAlert>
        ) : null}
      </StyledCompactSessionCardContent>
    </StyledSessionCard>
  )
}
