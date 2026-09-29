import { useTranslation } from 'react-i18next'
import {
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SensorsIcon from '@mui/icons-material/Sensors'
import { styled } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'
import {
  isPrizeSpinArchived,
  type PrizeSpinArchivedFilter,
  type PrizeSpinRecord,
} from '@/api/prize-spin'
import { PrizeSpinArchiveDialog } from '@/components/prize-spin/prize-spin-page/PrizeSpinArchiveDialog'
import { PrizeSpinCopyDialog } from '@/components/prize-spin/prize-spin-page/PrizeSpinCopyDialog'
import { PrizeSpinCreateDialog } from '@/components/prize-spin/prize-spin-page/PrizeSpinCreateDialog'
import { PrizeSpinHistoryList } from '@/components/prize-spin/prize-spin-page/PrizeSpinHistoryList'
import { PrizeSpinHistoryLiveHero } from '@/components/prize-spin/prize-spin-page/PrizeSpinHistoryLiveHero'
import {
  formatPrizeSpinLiveSessionHint,
  PRIZE_SPIN_HISTORY_PAGE_SIZE,
} from '@/components/prize-spin/prize-spin-page/prize-spin-page-utils'
import { SectionHeader } from '@/components/SectionHeader'
import { useNotification } from '@/context/NotificationContext'
import { useGoLivePrizeSpin, usePrizeSpins } from '@/queries/use-prize-spins'

type PrizeSpinHistorySectionProps = {
  accountId: number
}

const LIVE_PEEK_LIMIT = 50

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.spacing(1),
  boxShadow: 'none',
}))

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  },
}))

const StyledContentStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3),
}))

const StyledFilterFormControl = styled(FormControl)({
  minWidth: 140,
})

const StyledFilterSelect = styled(Select)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
}))

function findLiveRecord(records: PrizeSpinRecord[]): PrizeSpinRecord | null {
  return (
    records.find(
      (record) => record.status === 'live' && !isPrizeSpinArchived(record),
    ) ?? null
  )
}

export const PrizeSpinHistorySection = ({
  accountId,
}: PrizeSpinHistorySectionProps) => {
  const { t } = useTranslation()
  const { showError, showSuccess } = useNotification()
  const goLiveMutation = useGoLivePrizeSpin(accountId)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [archiveDialogRecord, setArchiveDialogRecord] =
    useState<PrizeSpinRecord | null>(null)
  const [copyDialogRecord, setCopyDialogRecord] =
    useState<PrizeSpinRecord | null>(null)
  const [archivedFilter, setArchivedFilter] =
    useState<PrizeSpinArchivedFilter>('false')
  const [recordsPage, setRecordsPage] = useState(1)

  const showLiveHero = archivedFilter !== 'true'

  const {
    data: recordsResult,
    isLoading: loadingRecords,
    isFetching: fetchingRecords,
    error: recordsQueryError,
  } = usePrizeSpins(accountId, {
    archived: archivedFilter,
    page: recordsPage,
    limit: PRIZE_SPIN_HISTORY_PAGE_SIZE,
  })

  const {
    data: activePeekResult,
    isLoading: loadingLivePeek,
    isFetching: fetchingLivePeek,
  } = usePrizeSpins(showLiveHero ? accountId : undefined, {
    archived: 'false',
    page: 1,
    limit: LIVE_PEEK_LIMIT,
  })

  const records = recordsResult?.records ?? []
  const recordsTotal =
    typeof recordsResult?.total === 'number'
      ? recordsResult.total
      : records.length

  const liveRecord = useMemo(
    () =>
      showLiveHero ? findLiveRecord(activePeekResult?.records ?? []) : null,
    [activePeekResult?.records, showLiveHero],
  )

  const listRecords = useMemo(() => {
    if (!liveRecord) {
      return records
    }

    return records.filter((record) => record.id !== liveRecord.id)
  }, [liveRecord, records])

  const listEmptyMessage =
    archivedFilter === 'true'
      ? t('prizeSpin.noArchivedSessions')
      : liveRecord && records.length <= 1 && listRecords.length === 0
        ? t('prizeSpin.historyNoOtherSessions')
        : t('prizeSpin.noSessions')

  useEffect(() => {
    if (!recordsQueryError) {
      return
    }

    showError(t('prizeSpin.couldNotLoadHistory'))
  }, [recordsQueryError, showError, t])

  useEffect(() => {
    if (
      recordsResult &&
      recordsResult.records.length === 0 &&
      recordsResult.total > 0 &&
      recordsPage > 1
    ) {
      setRecordsPage(recordsPage - 1)
    }
  }, [recordsResult, recordsPage])

  const listLoading = loadingRecords || fetchingRecords
  const heroLoading = showLiveHero && (loadingLivePeek || fetchingLivePeek)

  return (
    <>
      <StyledCard elevation={0}>
        <StyledCardContent>
          <StyledContentStack>
            <SectionHeader
              title={t('common.sessionsTitle')}
              description={t('common.sessionsSectionDescription')}
              icon={SensorsIcon}
              iconVariant="warning"
              action={
                <Button
                  type="button"
                  variant="contained"
                  startIcon={<AddIcon fontSize="small" aria-hidden />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  {t('common.newSession')}
                </Button>
              }
            />
            {showLiveHero ? (
              <PrizeSpinHistoryLiveHero
                record={liveRecord}
                loading={heroLoading && !liveRecord}
              />
            ) : null}
            <PrizeSpinHistoryList
              records={listRecords}
              loading={listLoading}
              emptyMessage={listEmptyMessage}
              showArchiveAction={archivedFilter !== 'true'}
              showGoLiveAction={archivedFilter !== 'true'}
              showSectionTitle={showLiveHero}
              goLivePendingId={
                goLiveMutation.isPending ? goLiveMutation.variables : undefined
              }
              onArchive={setArchiveDialogRecord}
              onCopy={setCopyDialogRecord}
              onGoLive={(record) => {
                goLiveMutation.mutate(record.id, {
                  onSuccess: () =>
                    showSuccess(formatPrizeSpinLiveSessionHint(t)),
                  onError: (error) =>
                    showError(
                      error instanceof Error
                        ? error.message
                        : t('prizeSpin.couldNotGoLive'),
                    ),
                })
              }}
              toolbar={
                <StyledFilterFormControl size="small">
                  <InputLabel id="prize-spin-archived-filter-label">
                    {t('common.show')}
                  </InputLabel>
                  <StyledFilterSelect
                    labelId="prize-spin-archived-filter-label"
                    label={t('common.show')}
                    value={archivedFilter}
                    onChange={(event) => {
                      setArchivedFilter(
                        event.target.value as PrizeSpinArchivedFilter,
                      )
                      setRecordsPage(1)
                    }}
                  >
                    <MenuItem value="false">{t('common.active')}</MenuItem>
                    <MenuItem value="true">{t('common.archived')}</MenuItem>
                    <MenuItem value="all">{t('common.all')}</MenuItem>
                  </StyledFilterSelect>
                </StyledFilterFormControl>
              }
              pagination={{
                count: recordsTotal,
                page: recordsPage,
                onPageChange: setRecordsPage,
                rowsPerPage: PRIZE_SPIN_HISTORY_PAGE_SIZE,
              }}
            />
          </StyledContentStack>
        </StyledCardContent>
      </StyledCard>
      <PrizeSpinArchiveDialog
        accountId={accountId}
        open={!!archiveDialogRecord}
        record={archiveDialogRecord}
        onClose={() => setArchiveDialogRecord(null)}
      />
      <PrizeSpinCopyDialog
        accountId={accountId}
        open={!!copyDialogRecord}
        record={copyDialogRecord}
        onClose={() => setCopyDialogRecord(null)}
      />
      <PrizeSpinCreateDialog
        accountId={accountId}
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={() => setRecordsPage(1)}
      />
    </>
  )
}
