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
import { styled } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import {
  type PrizeSpinArchivedFilter,
  type PrizeSpinRecord,
} from '@/api/prize-spin'
import { AppTable } from '@/components/AppTable'
import { PrizeSpinArchiveDialog } from '@/components/prize-spin/prize-spin-page/PrizeSpinArchiveDialog'
import { PrizeSpinCopyDialog } from '@/components/prize-spin/prize-spin-page/PrizeSpinCopyDialog'
import { PrizeSpinCreateDialog } from '@/components/prize-spin/prize-spin-page/PrizeSpinCreateDialog'
import { PrizeSpinRecordExpandedDetails } from '@/components/prize-spin/prize-spin-page/PrizeSpinRecordExpandedDetails'
import { PRIZE_SPIN_HISTORY_PAGE_SIZE } from '@/components/prize-spin/prize-spin-page/prize-spin-page-utils'
import { buildPrizeSpinRecordColumns } from '@/components/prize-spin/prize-spin-page/prizeSpinRecordColumns'
import { SectionHeader, sectionTableIcon } from '@/components/SectionHeader'
import { useNotification } from '@/context/NotificationContext'
import { usePrizeSpins } from '@/queries/use-prize-spins'

type PrizeSpinHistorySectionProps = {
  accountId: number
}

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
  gap: theme.spacing(2),
}))

const StyledFilterFormControl = styled(FormControl)({
  minWidth: 140,
})

const StyledFilterSelect = styled(Select)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
}))

export const PrizeSpinHistorySection = ({
  accountId,
}: PrizeSpinHistorySectionProps) => {
  const { t } = useTranslation()
  const { showError } = useNotification()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [expandedRecordIds, setExpandedRecordIds] = useState<Set<number>>(
    new Set(),
  )
  const [archiveDialogRecord, setArchiveDialogRecord] =
    useState<PrizeSpinRecord | null>(null)
  const [copyDialogRecord, setCopyDialogRecord] =
    useState<PrizeSpinRecord | null>(null)
  const [archivedFilter, setArchivedFilter] =
    useState<PrizeSpinArchivedFilter>('false')
  const [recordsPage, setRecordsPage] = useState(1)

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

  const records = recordsResult?.records ?? []
  const recordsTotal =
    typeof recordsResult?.total === 'number'
      ? recordsResult.total
      : records.length

  useEffect(() => {
    if (!recordsQueryError) {
      return
    }

    showError(t('prizeSpin.couldNotLoadHistory'))
  }, [recordsQueryError, showError])

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

  const openArchiveDialog = (record: PrizeSpinRecord) =>
    setArchiveDialogRecord(record)

  const openCopyDialog = (record: PrizeSpinRecord) => setCopyDialogRecord(record)

  const toggleRecordExpanded = (recordId: number) => {
    setExpandedRecordIds((previous) => {
      const next = new Set(previous)
      if (next.has(recordId)) {
        next.delete(recordId)
      } else {
        next.add(recordId)
      }
      return next
    })
  }

  const recordColumns = buildPrizeSpinRecordColumns(t, {
    onArchive: openArchiveDialog,
    onCopy: openCopyDialog,
  })

  return (
    <>
      <StyledCard elevation={0}>
        <StyledCardContent>
          <StyledContentStack>
            <SectionHeader
              title={t('prizeSpin.historyTitle')}
              description={t('prizeSpin.historyDescriptionPast')}
              icon={sectionTableIcon}
              iconVariant="purple"
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
            <AppTable
              columns={recordColumns}
              rows={records}
              loading={loadingRecords || fetchingRecords}
              getRowKey={(record) => record.id}
              emptyMessage={
                archivedFilter === 'true'
                  ? t('prizeSpin.noArchivedSessions')
                  : t('prizeSpin.noSessions')
              }
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
              expandable={{
                isExpanded: (record) => expandedRecordIds.has(record.id),
                onToggle: (record) => toggleRecordExpanded(record.id),
                ariaLabel: (record) =>
                  expandedRecordIds.has(record.id)
                    ? t('table.collapseDetailsAria', { title: record.title })
                    : t('table.expandDetailsAria', { title: record.title }),
                renderDetail: (record) => (
                  <PrizeSpinRecordExpandedDetails record={record} />
                ),
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
