import { Button, Chip, Stack, Typography } from '@mui/material'
import ArchiveIcon from '@mui/icons-material/Archive'
import EditIcon from '@mui/icons-material/Edit'
import { styled, useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import type { BonusBuyRecord } from '@/api/bonus-buy'
import { isBonusBuyActive } from '@/api/bonus-buy'
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

export const BonusBuySessionHeaderSection = (
  props: BonusBuySessionHeaderSectionProps,
) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const active = isBonusBuyActive(props.record)

  return (
    <StyledSessionCard elevation={0}>
      <StyledCompactSessionCardContent>
        <HeaderStack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
          <TitleStack direction="row" spacing={1}>
            <SessionTitle variant="h6" noWrap>
              {props.record.name}{' '}
              <SessionId>#{props.record.id}</SessionId>
            </SessionTitle>
            {!active ? (
              <Chip label={t('common.archived')} size="small" sx={mutedChipSx(theme)} />
            ) : null}
          </TitleStack>
          <ActionsStack direction="row">
            {active ? (
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
            {active ? (
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
        {!active ? (
          <ReadOnlyAlert tone="info">
            {t('bonusBuy.sessionArchivedViewOnly')}
          </ReadOnlyAlert>
        ) : null}
      </StyledCompactSessionCardContent>
    </StyledSessionCard>
  )
}
