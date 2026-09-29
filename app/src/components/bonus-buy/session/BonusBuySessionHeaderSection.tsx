import { Button, Chip, Stack, Typography } from '@mui/material'
import ArchiveIcon from '@mui/icons-material/Archive'
import EditIcon from '@mui/icons-material/Edit'
import { styled, useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import type { BonusBuyRecord } from '@/api/bonus-buy'
import { isBonusBuyReadOnly } from '@/api/bonus-buy'
import { ChatRollLiveStatusChip } from '@/components/chat-roll/ChatRollLiveStatusChip'
import { ChatRollSessionIdBadge } from '@/components/chat-roll/session/ChatRollSessionIdBadge'
import {
  StyledCompactSessionCardContent,
  StyledSessionCard,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { StatusAlert } from '@/components/StatusAlert'
import { mutedChipSx } from '@/theme/colors'

type BonusBuySessionHeaderSectionProps = {
  record: BonusBuyRecord
  onOpenArchiveDialog: () => void
  onOpenEditDialog: () => void
  onGoLive?: () => void
  liveActionPending?: boolean
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
  minWidth: 0,
})

const ActionsStack = styled(Stack)(({ theme }) => ({
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.spacing(1),
}))

const ReadOnlyAlert = styled(StatusAlert)(({ theme }) => ({
  marginTop: theme.spacing(2),
}))

export const BonusBuySessionHeaderSection = (
  props: BonusBuySessionHeaderSectionProps,
) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const readOnly = isBonusBuyReadOnly(props.record)

  return (
    <StyledSessionCard elevation={0}>
      <StyledCompactSessionCardContent>
        <HeaderStack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
          <TitleStack direction="row" spacing={1}>
            <ChatRollSessionIdBadge sessionId={props.record.id} />
            <SessionTitle variant="h6" noWrap>
              {props.record.name}
            </SessionTitle>
            {!readOnly && props.record.status === 'live' ? (
              <ChatRollLiveStatusChip />
            ) : null}
            {readOnly ? (
              <Chip label={t('common.archived')} size="small" sx={mutedChipSx(theme)} />
            ) : null}
          </TitleStack>
          <ActionsStack direction="row">
            {!readOnly && props.record.status === 'off_air' ? (
              <Button
                type="button"
                variant="contained"
                size="small"
                color="primary"
                disabled={props.liveActionPending}
                onClick={props.onGoLive}
              >
                {t('bonusBuy.goLive')}
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
        {readOnly ? (
          <ReadOnlyAlert tone="info">
            {t('bonusBuy.sessionArchivedViewOnly')}
          </ReadOnlyAlert>
        ) : null}
      </StyledCompactSessionCardContent>
    </StyledSessionCard>
  )
}
