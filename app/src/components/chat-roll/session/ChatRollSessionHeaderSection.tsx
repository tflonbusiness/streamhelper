import { Button, Chip, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import ArchiveIcon from '@mui/icons-material/Archive'
import { styled, useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import type { ChatRollRecord } from '@/api/chat-roll'
import { isChatRollReadOnly } from '@/api/chat-roll'
import {
  StyledCompactSessionCardContent,
  StyledSessionCard,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { StatusAlert } from '@/components/StatusAlert'
import { mutedChipSx } from '@/theme/colors'

type ChatRollSessionHeaderSectionProps = {
  record: ChatRollRecord
  onOpenArchiveDialog: () => void
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
          <TitleStack direction="row" spacing={1}>
            <SessionTitle variant="h6" noWrap>
              {props.record.title}{' '}
              <SessionId>#{props.record.id}</SessionId>
            </SessionTitle>
            {!props.record.isAcceptingParticipants && !readOnly ? (
              <Chip
                label={t('chatRoll.entriesPaused')}
                size="small"
                color="warning"
                variant="outlined"
              />
            ) : null}
            {readOnly ? (
              <Chip label={t('common.archived')} size="small" sx={mutedChipSx(theme)} />
            ) : null}
          </TitleStack>
          <ActionsStack direction="row">
            {props.primaryActions}
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
