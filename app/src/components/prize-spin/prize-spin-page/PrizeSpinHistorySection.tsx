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
import { styled, useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import {
  isPrizeSpinLive,
  type PrizeSpinArchivedFilter,
  type PrizeSpinRecord,
} from '@/api/prize-spin'
import { AppTable } from '@/components/AppTable'
import { PrizeSpinArchiveDialog } from '@/components/prize-spin/prize-spin-page/PrizeSpinArchiveDialog'
import { PrizeSpinCreateDialog } from '@/components/prize-spin/prize-spin-page/PrizeSpinCreateDialog'
import { PrizeSpinRecordExpandedDetails } from '@/components/prize-spin/prize-spin-page/PrizeSpinRecordExpandedDetails'
import {
  historyEmptyMessage,
  liveSessionRowSx,
  PRIZE_SPIN_HISTORY_PAGE_SIZE,
} from '@/components/prize-spin/prize-spin-page/prize-spin-page-utils'
import { buildPrizeSpinRecordColumns } from '@/components/prize-spin/prize-spin-page/prizeSpinRecordColumns'
import { SectionHeader, sectionTableIcon } from '@/components/SectionHeader'
import { useNotification } from '@/context/NotificationContext'
import {
  useDeactivatePrizeSpin,
  useGoLivePrizeSpin,
  usePrizeSpins,
} from '@/queries/use-prize-spins'

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
  const theme = useTheme()
  const { showSuccess, showError } = useNotification()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [expandedRecordIds, setExpandedRecordIds] = useState<Set<number>>(
    new Set(),
  )
  const [archiveDialogRecord, setArchiveDialogRecord] =
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
  });

  const goLiveMutation = useGoLivePrizeSpin(accountId)
  const deactivateMutation = useDeactivatePrizeSpin(accountId)

  const records = recordsResult?.records ?? []
  const recordsTotal =
    typeof recordsResult?.total === 'number'
      ? recordsResult.total
      : records.length

  const liveActionRecordId =
    goLiveMutation.isPending
      ? goLiveMutation.variables
      : deactivateMutation.isPending
        ? deactivateMutation.variables
        : null

  useEffect(() => {
    if (!recordsQueryError) {
      return
    }

    showError('Could not load prize spin history.')
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

  const handleGoLive = (record: PrizeSpinRecord) => {
    goLiveMutation.reset()
    deactivateMutation.reset()
    goLiveMutation.mutate(record.id, {
      onSuccess: () => showSuccess('Session is now live.'),
      onError: (error) => {
        showError(
          error instanceof Error ? error.message : 'Could not go live',
        )
      },
    })
  }

  const handleDeactivate = (record: PrizeSpinRecord) => {
    goLiveMutation.reset()
    deactivateMutation.reset()
    deactivateMutation.mutate(record.id, {
      onSuccess: () => showSuccess('Session taken off air.'),
      onError: (error) => {
        showError(
          error instanceof Error ? error.message : 'Could not deactivate session',
        )
      },
    })
  }

  const openArchiveDialog = (record: PrizeSpinRecord) => setArchiveDialogRecord(record);
  

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

  const recordColumns = buildPrizeSpinRecordColumns({
    liveActionRecordId,
    onGoLive: handleGoLive,
    onDeactivate: handleDeactivate,
    onArchive: openArchiveDialog,
  })

  return (
    <>
      <StyledCard elevation={0}>
        <StyledCardContent>
          <SectionHeader
            title="History"
            description="Prize spin sessions for this account"
            icon={sectionTableIcon}
            iconVariant="secondary"
            action={
              <Button
                type="button"
                variant="contained"
                startIcon={<AddIcon fontSize="small" />}
                onClick={() => setCreateDialogOpen(true)}
              >
                New
              </Button>
            }
          />
          <StyledContentStack>
            <AppTable
              columns={recordColumns}
              rows={records}
              loading={loadingRecords || fetchingRecords}
              getRowKey={(record) => record.id}
              emptyMessage={historyEmptyMessage(archivedFilter)}
              toolbar={
                <StyledFilterFormControl size="small">
                  <InputLabel id="prize-spin-archived-filter-label">
                    Show
                  </InputLabel>
                  <StyledFilterSelect
                    labelId="prize-spin-archived-filter-label"
                    label="Show"
                    value={archivedFilter}
                    onChange={(event) => {
                      setArchivedFilter(
                        event.target.value as PrizeSpinArchivedFilter,
                      )
                      setRecordsPage(1)
                    }}
                  >
                    <MenuItem value="false">Active</MenuItem>
                    <MenuItem value="true">Archived</MenuItem>
                    <MenuItem value="all">All</MenuItem>
                  </StyledFilterSelect>
                </StyledFilterFormControl>
              }
              getRowSx={(record) =>
                isPrizeSpinLive(record)
                  ? liveSessionRowSx(theme)
                  : undefined
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
                    ? `Collapse details for ${record.title}`
                    : `Expand details for ${record.title}`,
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
      <PrizeSpinCreateDialog
        accountId={accountId}
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={() => setRecordsPage(1)}
      />
    </>
  )
}
