import { Button, Chip, Stack, Typography } from '@mui/material'
import ArchiveIcon from '@mui/icons-material/Archive'
import PodcastsIcon from '@mui/icons-material/Podcasts'
import { SquareRounded as SquareRoundedIcon } from '@mui/icons-material'
import { alpha, styled, useTheme } from '@mui/material/styles'
import type { ChatRollRecord } from '@/api/chat-roll'
import { isChatRollLive, isChatRollReadOnly } from '@/api/chat-roll'
import { LiveStatusChip } from '@/components/LiveStatusChip'
import {
  StyledCompactSessionCardContent,
  StyledSessionCard,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { StatusAlert } from '@/components/StatusAlert'
import { useNotification } from '@/context/NotificationContext'
import {
  useDeactivateChatRollSession,
  useGoLiveChatRollSession,
} from '@/queries/use-chat-roll-session'
import { mutedChipSx } from '@/theme/colors'

type ChatRollSessionHeaderSectionProps = {
  accountId: number
  chatRollId: number
  record: ChatRollRecord
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

const ReadOnlyAlert = styled(StatusAlert)(({ theme }) => ({
  marginTop: theme.spacing(2),
}))

export const ChatRollSessionHeaderSection = (
  props: ChatRollSessionHeaderSectionProps,
) => {
  const theme = useTheme()
  const { showSuccess, showError } = useNotification()

  const goLiveMutation = useGoLiveChatRollSession(
    props.accountId,
    props.chatRollId,
  )
  const deactivateMutation = useDeactivateChatRollSession(
    props.accountId,
    props.chatRollId,
  )

  const readOnly = isChatRollReadOnly(props.record)
  const isLive = isChatRollLive(props.record)
  const actionsPending =
    deactivateMutation.isPending || goLiveMutation.isPending

  const handleGoLive = () => {
    goLiveMutation.mutate(undefined, {
      onSuccess: () => showSuccess('Session is now live.'),
      onError: (error) => {
        showError(error instanceof Error ? error.message : 'Could not go live')
      },
    })
  }

  return (
    <StyledSessionCard elevation={0}>
      <StyledCompactSessionCardContent>
        <HeaderStack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
          <TitleStack direction="row" spacing={1}>
            <SessionTitle variant="h6" noWrap>
              {props.record.title}{' '}
              <SessionId>#{props.record.id}</SessionId>
            </SessionTitle>
            {isLive ? <LiveStatusChip /> : null}
            {!props.record.isAcceptingParticipants && !readOnly ? (
              <Chip
                label="Entries paused"
                size="small"
                color="warning"
                variant="outlined"
              />
            ) : null}
            {readOnly ? (
              <Chip label="Archived" size="small" sx={mutedChipSx(theme)} />
            ) : null}
          </TitleStack>
          <ActionsStack direction="row">
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
