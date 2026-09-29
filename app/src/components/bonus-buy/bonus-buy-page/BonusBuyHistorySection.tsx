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
import { type BonusBuyArchivedFilter, type BonusBuyRecord } from '@/api/bonus-buy'
import { BonusBuyCreateDialog } from '@/components/bonus-buy/bonus-buy-page/BonusBuyCreateDialog'
import { BonusBuyHistoryList } from '@/components/bonus-buy/bonus-buy-page/BonusBuyHistoryList'
import { BonusBuyHistoryLiveHero } from '@/components/bonus-buy/bonus-buy-page/BonusBuyHistoryLiveHero'
import {
  BONUS_BUY_HISTORY_PAGE_SIZE,
  findLiveBonusBuyRecord,
  formatBonusBuyLiveSessionHint,
} from '@/components/bonus-buy/bonus-buy-page/bonus-buy-page-utils'
import { BonusBuyArchiveSessionDialog } from '@/components/bonus-buy/session/BonusBuyArchiveSessionDialog'
import { SectionHeader } from '@/components/SectionHeader'
import { useNotification } from '@/context/NotificationContext'
import { useBonusBuys, useGoLiveBonusBuy } from '@/queries/use-bonus-buy'

type BonusBuyHistorySectionProps = {
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

export const BonusBuyHistorySection = ({
  accountId,
}: BonusBuyHistorySectionProps) => {
  const { t } = useTranslation()
  const { showError, showSuccess } = useNotification()
  const goLiveMutation = useGoLiveBonusBuy(accountId)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [archiveDialogRecord, setArchiveDialogRecord] =
    useState<BonusBuyRecord | null>(null)
  const [archivedFilter, setArchivedFilter] =
    useState<BonusBuyArchivedFilter>('false')
  const [recordsPage, setRecordsPage] = useState(1)

  const showLiveHero = archivedFilter !== 'true'

  const {
    data: recordsResult,
    isLoading: loadingRecords,
    isFetching: fetchingRecords,
    error: recordsQueryError,
  } = useBonusBuys(accountId, {
    archived: archivedFilter,
    page: recordsPage,
    limit: BONUS_BUY_HISTORY_PAGE_SIZE,
  })

  const {
    data: activePeekResult,
    isLoading: loadingActivePeek,
    isFetching: fetchingActivePeek,
  } = useBonusBuys(showLiveHero ? accountId : undefined, {
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
      showLiveHero ? findLiveBonusBuyRecord(activePeekResult?.records ?? []) : null,
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
      ? t('bonusBuy.noArchived')
      : liveRecord && records.length <= 1 && listRecords.length === 0
        ? t('bonusBuy.historyNoOtherSessions')
        : t('bonusBuy.noSessions')

  useEffect(() => {
    if (!recordsQueryError) {
      return
    }

    showError(t('bonusBuy.couldNotLoadHistory'))
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
  const heroLoading = showLiveHero && (loadingActivePeek || fetchingActivePeek)

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
              <BonusBuyHistoryLiveHero
                record={liveRecord}
                loading={heroLoading && !liveRecord}
              />
            ) : null}
            <BonusBuyHistoryList
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
              onGoLive={(record) => {
                goLiveMutation.mutate(record.id, {
                  onSuccess: () =>
                    showSuccess(formatBonusBuyLiveSessionHint(t)),
                  onError: (error) =>
                    showError(
                      error instanceof Error
                        ? error.message
                        : t('bonusBuy.couldNotGoLive'),
                    ),
                })
              }}
              toolbar={
                <StyledFilterFormControl size="small">
                  <InputLabel id="bonus-buy-archived-filter-label">
                    {t('common.show')}
                  </InputLabel>
                  <StyledFilterSelect
                    labelId="bonus-buy-archived-filter-label"
                    label={t('common.show')}
                    value={archivedFilter}
                    onChange={(event) => {
                      setArchivedFilter(
                        event.target.value as BonusBuyArchivedFilter,
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
                rowsPerPage: BONUS_BUY_HISTORY_PAGE_SIZE,
              }}
            />
          </StyledContentStack>
        </StyledCardContent>
      </StyledCard>
      <BonusBuyArchiveSessionDialog
        accountId={accountId}
        bonusBuyId={archiveDialogRecord?.id ?? 0}
        open={!!archiveDialogRecord}
        record={archiveDialogRecord}
        onClose={() => setArchiveDialogRecord(null)}
      />
      <BonusBuyCreateDialog
        accountId={accountId}
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={() => setRecordsPage(1)}
      />
    </>
  )
}
