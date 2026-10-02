import { Button, Stack } from '@mui/material'
import ArchiveIcon from '@mui/icons-material/Archive'
import EditIcon from '@mui/icons-material/Edit'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import type { BonusBuyRecord } from '@/api/bonus-buy'
import { isBonusBuyReadOnly } from '@/api/bonus-buy'
import { bonusBuyHistoryStatusChip } from '@/components/bonus-buy/bonus-buy-page/bonusBuyHistoryStatusChip'
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

type BonusBuySessionHeaderSectionProps = {
  record: BonusBuyRecord
  onOpenArchiveDialog: () => void
  onOpenEditDialog: () => void
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

export const BonusBuySessionHeaderSection = (
  props: BonusBuySessionHeaderSectionProps,
) => {
  const { t } = useTranslation()
  const readOnly = isBonusBuyReadOnly(props.record)

  return (
    <StyledSessionCard elevation={0}>
      <StyledCompactSessionCardContent>
        <HeaderStack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
          <StyledSessionHeaderTitleRow>
            <ChatRollSessionIdBadge sessionId={props.record.id} />
            <StyledSessionHeaderTitle variant="h6" noWrap>
              {props.record.name}
            </StyledSessionHeaderTitle>
            {bonusBuyHistoryStatusChip(props.record, t)}
          </StyledSessionHeaderTitleRow>
          <ActionsStack direction="row">
            {!readOnly && props.record.status === 'off_air' ? (
              <Button
                type="button"
                variant="contained"
                size="small"
                color="primary"
                disabled={props.liveActionPending || props.goLiveDisabled}
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
        <SessionHeaderEntitlementNotices
          envelope={props.envelope}
          module="bonusBuy"
        />
        {readOnly ? (
          <ReadOnlyAlert>{t('bonusBuy.sessionArchivedViewOnly')}</ReadOnlyAlert>
        ) : null}
      </StyledCompactSessionCardContent>
    </StyledSessionCard>
  )
}
