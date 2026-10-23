import {
  Box,
  LinearProgress,
  Skeleton,
  TablePagination,
  Typography,
} from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import type { GrowingJackpotRecord } from '@/api/growing-jackpot'
import { GrowingJackpotHistorySessionCard } from '@/components/growing-jackpot/growing-jackpot-page/GrowingJackpotHistorySessionCard'
import { colors } from '@/theme/colors'

export type GrowingJackpotHistoryListPagination = {
  count: number
  page: number
  onPageChange: (page: number) => void
  rowsPerPage: number
}

type GrowingJackpotHistoryListProps = {
  records: GrowingJackpotRecord[]
  loading?: boolean
  emptyMessage?: React.ReactNode
  toolbar?: React.ReactNode
  pagination?: GrowingJackpotHistoryListPagination
  showArchiveAction?: boolean
  showGoLiveAction?: boolean
  showSectionTitle?: boolean
  goLivePendingId?: number
  goLiveDisabled?: boolean
  onArchive: (record: GrowingJackpotRecord) => void
  onGoLive: (record: GrowingJackpotRecord) => void
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
  padding: theme.spacing(3, 2),
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
  padding: theme.spacing(3, 2),
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

export function GrowingJackpotHistoryList(props: GrowingJackpotHistoryListProps) {
  const { t } = useTranslation()
  const isEmpty = props.records.length === 0
  const showPagination =
    props.pagination != null && props.pagination.count > 0
  const hasHeader = props.showSectionTitle || props.toolbar

  if (isEmpty && props.emptyMessage && !hasHeader && !props.loading) {
    return (
      <StyledListEmptyContainer>{props.emptyMessage}</StyledListEmptyContainer>
    )
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
            {props.showSectionTitle ? (
              <Box component="h3" sx={{ margin: 0 }}>
                <StyledSectionTitle>
                  {t('common.otherSessionsTitle')}
                </StyledSectionTitle>
              </Box>
            ) : null}
            {props.toolbar ?? null}
          </Box>
        </StyledListHeader>
      ) : null}
      <StyledProgressSlot aria-hidden={!props.loading}>
        <StyledListProgress active={props.loading} aria-hidden={!props.loading} />
      </StyledProgressSlot>
      {isEmpty && !props.loading && props.emptyMessage ? (
        <StyledListEmpty>{props.emptyMessage}</StyledListEmpty>
      ) : props.loading && isEmpty ? (
        <StyledCardGrid aria-busy="true" aria-label={t('common.loading')}>
          <Skeleton variant="rounded" height={140} />
          <Skeleton variant="rounded" height={140} />
        </StyledCardGrid>
      ) : !isEmpty ? (
        <StyledCardGrid>
          {props.records.map((record) => (
            <GrowingJackpotHistorySessionCard
              key={record.id}
              record={record}
              showArchiveAction={props.showArchiveAction}
              showGoLiveAction={props.showGoLiveAction}
              goLivePending={props.goLivePendingId === record.id}
              goLiveDisabled={props.goLiveDisabled}
              onArchive={props.onArchive}
              onGoLive={props.onGoLive}
            />
          ))}
        </StyledCardGrid>
      ) : null}
      {showPagination && props.pagination ? (
        <StyledListFooter>
          <StyledListPagination
            slots={{ root: 'div' }}
            count={props.pagination.count}
            page={props.pagination.page - 1}
            onPageChange={(_, newPage) =>
              props.pagination!.onPageChange(newPage + 1)
            }
            rowsPerPage={props.pagination.rowsPerPage}
            rowsPerPageOptions={[props.pagination.rowsPerPage]}
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
