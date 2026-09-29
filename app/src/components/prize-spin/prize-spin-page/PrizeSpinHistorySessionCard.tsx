import { Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import ArchiveIcon from '@mui/icons-material/Archive'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { alpha, styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  isPrizeSpinArchived,
  isPrizeSpinReadOnly,
  type PrizeSpinRecord,
} from '@/api/prize-spin'
import { prizeSpinHistoryStatusChip } from '@/components/prize-spin/prize-spin-page/prizeSpinHistoryStatusChip'
import { formatPrizeSpinDateTime } from '@/components/prize-spin/prize-spin-utils'
import { OpenSessionButton } from '@/components/OpenSessionButton'
import { prizeSpinSessionRoute } from '@/lib/routes'
import { colors } from '@/theme/colors'

type PrizeSpinHistorySessionCardProps = {
  record: PrizeSpinRecord
  showArchiveAction?: boolean
  showGoLiveAction?: boolean
  goLivePending?: boolean
  onArchive: (record: PrizeSpinRecord) => void
  onCopy: (record: PrizeSpinRecord) => void
  onGoLive: (record: PrizeSpinRecord) => void
}

const StyledCard = styled(Stack)(({ theme }) => ({
  height: '100%',
  minWidth: 0,
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  gap: theme.spacing(1),
  backgroundColor: alpha(colors.neutral[100], 0.02),
  transition: 'border-color 0.15s ease, background-color 0.15s ease',
  '&:hover': {
    backgroundColor: alpha(colors.neutral[100], 0.04),
    borderColor: alpha(theme.palette.primary.main, 0.25),
  },
}))

const StyledTitleRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1.5),
}))

const StyledTitleLink = styled(Link)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: 'inherit',
  borderRadius: theme.shape.borderRadius,
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
}))

const StyledTitleMain = styled(Box)(({ theme }) => ({
  display: 'flex',
  flex: 1,
  minWidth: 0,
  alignItems: 'center',
  gap: theme.spacing(1),
}))

const CardIndex = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 28,
  height: 24,
  paddingLeft: theme.spacing(0.75),
  paddingRight: theme.spacing(0.75),
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1,
  color: theme.palette.text.secondary,
  backgroundColor: alpha(theme.palette.text.primary, 0.06),
  border: '1px solid',
  borderColor: alpha(theme.palette.text.primary, 0.1),
  flexShrink: 0,
}))

const RecordTitle = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'archived',
})<{ archived?: boolean }>(({ theme, archived }) => ({
  fontWeight: 600,
  fontSize: '0.9375rem',
  lineHeight: 1.35,
  color: archived ? theme.palette.text.secondary : theme.palette.text.primary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}))

const RecordMeta = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
  lineHeight: 1.4,
}))

const StyledCardActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
  marginTop: 'auto',
  paddingTop: theme.spacing(1.5),
  borderTop: '1px solid',
  borderColor: alpha(colors.neutral[100], 0.08),
  flexWrap: 'wrap',
}))

const StyledSecondaryActions = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  flexShrink: 0,
})

const StyledPrimaryActions = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
  flex: 1,
  minWidth: 0,
  flexWrap: 'wrap',
  '& .MuiButton-root': {
    width: 'auto',
    flex: 'none',
  },
}))

const StyledActionIconButton = styled(IconButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  width: 32,
  height: 32,
  border: '1px solid',
  borderColor: theme.palette.divider,
  color: theme.palette.text.secondary,
  '&:hover': {
    bgcolor: alpha(theme.palette.text.primary, 0.06),
    borderColor: alpha(theme.palette.text.primary, 0.2),
    color: theme.palette.text.primary,
  },
}))

const actionIconSx = { fontSize: 16 } as const

export function PrizeSpinHistorySessionCard({
  record,
  showArchiveAction = true,
  showGoLiveAction = true,
  goLivePending = false,
  onArchive,
  onCopy,
  onGoLive,
}: PrizeSpinHistorySessionCardProps) {
  const { t } = useTranslation()
  const archived = isPrizeSpinArchived(record)
  const readOnly = isPrizeSpinReadOnly(record)
  const canGoLive =
    showGoLiveAction && !readOnly && record.status === 'off_air'
  const sessionPath = prizeSpinSessionRoute(record.id)
  const meta = t('prizeSpin.historyCardMeta', {
    author: record.createdByName,
    created: formatPrizeSpinDateTime(record.createdAt),
  })
  const showSecondaryArchive = showArchiveAction && !archived
  const indexLabel = t('prizeSpin.historyCardIndex', { index: record.id })
  const statusLabel = archived
    ? t('table.archived')
    : record.status === 'live'
      ? t('common.live')
      : t('common.inactive')

  return (
    <StyledCard>
      <StyledTitleRow>
        <StyledTitleMain>
          <CardIndex aria-hidden>{indexLabel}</CardIndex>
          <StyledTitleLink
            to={sessionPath}
            aria-label={t('prizeSpin.historyListItemAria', {
              index: indexLabel,
              title: record.title,
              status: statusLabel,
            })}
          >
            <RecordTitle archived={archived}>{record.title}</RecordTitle>
          </StyledTitleLink>
        </StyledTitleMain>
        {prizeSpinHistoryStatusChip(record, t)}
      </StyledTitleRow>
      <RecordMeta>{meta}</RecordMeta>
      <StyledCardActions>
        <StyledSecondaryActions>
          {showSecondaryArchive ? (
            <Tooltip title={t('table.archive')}>
              <span>
                <StyledActionIconButton
                  type="button"
                  aria-label={t('table.archiveAria', { title: record.title })}
                  size="small"
                  disabled={readOnly}
                  onClick={() => onArchive(record)}
                >
                  <ArchiveIcon sx={actionIconSx} aria-hidden />
                </StyledActionIconButton>
              </span>
            </Tooltip>
          ) : null}
          <Tooltip title={t('table.copySession')}>
            <StyledActionIconButton
              type="button"
              aria-label={t('table.copySessionAria', { title: record.title })}
              size="small"
              onClick={() => onCopy(record)}
            >
              <ContentCopyIcon sx={actionIconSx} aria-hidden />
            </StyledActionIconButton>
          </Tooltip>
        </StyledSecondaryActions>
        <StyledPrimaryActions>
          {canGoLive ? (
            <Button
              type="button"
              variant="contained"
              color="primary"
              size="small"
              disabled={goLivePending}
              onClick={() => onGoLive(record)}
            >
              {t('prizeSpin.goLive')}
            </Button>
          ) : null}
          <OpenSessionButton
            to={sessionPath}
            variant="outlined"
            aria-label={t('table.openAria', { title: record.title })}
            fullWidth={false}
          />
        </StyledPrimaryActions>
      </StyledCardActions>
    </StyledCard>
  )
}
