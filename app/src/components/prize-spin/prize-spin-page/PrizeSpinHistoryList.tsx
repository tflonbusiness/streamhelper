import {
  Box,
  LinearProgress,
  Skeleton,
  TablePagination,
  Typography,
} from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import type { PrizeSpinRecord } from '@/api/prize-spin'
import { PrizeSpinHistorySessionCard } from '@/components/prize-spin/prize-spin-page/PrizeSpinHistorySessionCard'
import { colors } from '@/theme/colors'

export type PrizeSpinHistoryListPagination = {
  count: number
  page: number
  onPageChange: (page: number) => void
  rowsPerPage: number
}

type PrizeSpinHistoryListProps = {
  records: PrizeSpinRecord[]
  loading?: boolean
  emptyMessage?: React.ReactNode
  toolbar?: React.ReactNode
  pagination?: PrizeSpinHistoryListPagination
  showArchiveAction?: boolean
  showGoLiveAction?: boolean
  showSectionTitle?: boolean
  goLivePendingId?: number
  onArchive: (record: PrizeSpinRecord) => void
  onCopy: (record: PrizeSpinRecord) => void
  onGoLive: (record: PrizeSpinRecord) => void
}

const StyledListContainer = styled(Box)(({ theme }) => ({
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  backgroundColor: alpha(colors.neutral[100], 0.02),
}))

const StyledListHeader = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
}))

const StyledSectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.6875rem',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
}))

const StyledListToolbar = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
}))

const StyledProgressSlot = styled(Box)({
  height: 4,
  flexShrink: 0,
})

const StyledListProgress = styled(LinearProgress, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  height: 4,
  visibility: active ? 'visible' : 'hidden',
}))

const StyledCardGrid = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: theme.spacing(1.5),
  alignItems: 'stretch',
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
}))

const StyledListEmpty = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
}))

const StyledListEmptyContainer = styled(Box)(({ theme }) => ({
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  backgroundColor: alpha(colors.neutral[100], 0.02),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
}))

const StyledListFooter = styled(Box)(({ theme }) => ({
  borderTop: '1px solid',
  borderColor: theme.palette.divider,
}))

const StyledListPagination = styled(TablePagination)({
  border: 0,
  width: '100%',
  '& .MuiTablePagination-selectLabel': {
    display: 'none',
  },
  '& .MuiTablePagination-select': {
    display: 'none',
  },
  '& .MuiTablePagination-displayedRows': {
    marginLeft: 'auto',
  },
})

export function PrizeSpinHistoryList({
  records,
  loading = false,
  emptyMessage,
  toolbar,
  pagination,
  showArchiveAction = true,
  showGoLiveAction = true,
  showSectionTitle = false,
  goLivePendingId,
  onArchive,
  onCopy,
  onGoLive,
}: PrizeSpinHistoryListProps) {
  const { t } = useTranslation()
  const isEmpty = records.length === 0
  const showPagination = pagination != null && pagination.count > 0
  const hasHeader = showSectionTitle || toolbar

  if (isEmpty && emptyMessage && !hasHeader && !loading) {
    return <StyledListEmptyContainer>{emptyMessage}</StyledListEmptyContainer>
  }

  return (
    <StyledListContainer>
      {hasHeader ? (
        <StyledListHeader>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            {showSectionTitle ? (
              <Box component="h3" sx={{ margin: 0 }}>
                <StyledSectionTitle>
                  {t('common.otherSessionsTitle')}
                </StyledSectionTitle>
              </Box>
            ) : null}
            {toolbar ?? null}
          </Box>
        </StyledListHeader>
      ) : null}
      {toolbar && !hasHeader ? (
        <StyledListToolbar>{toolbar}</StyledListToolbar>
      ) : null}
      <StyledProgressSlot aria-hidden={!loading}>
        <StyledListProgress active={loading} aria-hidden={!loading} />
      </StyledProgressSlot>
      {isEmpty && !loading && emptyMessage ? (
        <StyledListEmpty>{emptyMessage}</StyledListEmpty>
      ) : loading && isEmpty ? (
        <StyledCardGrid aria-busy="true" aria-label={t('common.loading')}>
          <Skeleton variant="rounded" height={140} />
          <Skeleton variant="rounded" height={140} />
        </StyledCardGrid>
      ) : !isEmpty ? (
        <StyledCardGrid>
          {records.map((record) => (
            <PrizeSpinHistorySessionCard
              key={record.id}
              record={record}
              showArchiveAction={showArchiveAction}
              showGoLiveAction={showGoLiveAction}
              goLivePending={goLivePendingId === record.id}
              onArchive={onArchive}
              onCopy={onCopy}
              onGoLive={onGoLive}
            />
          ))}
        </StyledCardGrid>
      ) : null}
      {showPagination ? (
        <StyledListFooter>
          <StyledListPagination
            slots={{ root: 'div' }}
            count={pagination.count}
            page={pagination.page - 1}
            onPageChange={(_, newPage) => pagination.onPageChange(newPage + 1)}
            rowsPerPage={pagination.rowsPerPage}
            rowsPerPageOptions={[pagination.rowsPerPage]}
            labelRowsPerPage=""
            labelDisplayedRows={({ from, to, count }) =>
              count !== -1
                ? t('table.displayedRows', { from, to, count })
                : t('table.displayedRowsMoreThan', { to })
            }
          />
        </StyledListFooter>
      ) : null}
    </StyledListContainer>
  )
}
