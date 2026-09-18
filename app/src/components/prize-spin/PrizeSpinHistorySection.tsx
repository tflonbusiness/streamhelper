import {
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Plus, RotateCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  isPrizeSpinLive,
  type PrizeSpinArchivedFilter,
  type PrizeSpinRecord,
} from '@/api/prize-spin'
import { AppTable } from '@/components/AppTable'
import { PrizeSpinArchiveDialog } from '@/components/prize-spin/PrizeSpinArchiveDialog'
import { PrizeSpinCreateDialog } from '@/components/prize-spin/PrizeSpinCreateDialog'
import { PrizeSpinRecordExpandedDetails } from '@/components/prize-spin/PrizeSpinRecordExpandedDetails'
import {
  historyEmptyMessage,
  liveSessionRowSx,
  PRIZE_SPIN_HISTORY_PAGE_SIZE,
} from '@/components/prize-spin/prize-spin-page-utils'
import { buildPrizeSpinRecordColumns } from '@/components/prize-spin/prizeSpinRecordColumns'
import { SectionHeader } from '@/components/SectionHeader'
import { StatusAlert } from '@/components/StatusAlert'
import { useNotification } from '@/context/NotificationContext'
import {
  useDeactivatePrizeSpin,
  useGoLivePrizeSpin,
  usePrizeSpins,
} from '@/queries/use-prize-spins'
import { cardSx, inputFieldSx } from '@/theme/colors'

type PrizeSpinHistorySectionProps = {
  accountId?: number
}

export function PrizeSpinHistorySection({
  accountId,
}: PrizeSpinHistorySectionProps) {
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

  const listParams = {
    archived: archivedFilter,
    page: recordsPage,
    limit: PRIZE_SPIN_HISTORY_PAGE_SIZE,
  }

  const {
    data: recordsResult,
    isLoading: loadingRecords,
    error: recordsQueryError,
  } = usePrizeSpins(accountId, listParams)

  const goLiveMutation = useGoLivePrizeSpin(accountId)
  const deactivateMutation = useDeactivatePrizeSpin(accountId)

  const records = recordsResult?.records ?? []
  const recordsTotal =
    typeof recordsResult?.total === 'number'
      ? recordsResult.total
      : records.length
  const recordsError =
    recordsQueryError instanceof Error
      ? recordsQueryError.message
      : recordsQueryError
        ? 'Could not load prize spin history'
        : null

  const liveActionRecordId =
    goLiveMutation.isPending
      ? goLiveMutation.variables
      : deactivateMutation.isPending
        ? deactivateMutation.variables
        : null

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

  function handleGoLive(record: PrizeSpinRecord) {
    if (!accountId) {
      return
    }

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

  function handleDeactivate(record: PrizeSpinRecord) {
    if (!accountId) {
      return
    }

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

  function openArchiveDialog(record: PrizeSpinRecord) {
    setArchiveDialogRecord(record)
  }

  function toggleRecordExpanded(recordId: number) {
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
    theme,
    liveActionRecordId,
    onGoLive: handleGoLive,
    onDeactivate: handleDeactivate,
    onArchive: openArchiveDialog,
  })

  return (
    <>
      <Card elevation={0} sx={cardSx}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <SectionHeader
            title="History"
            description="Prize spin sessions for this account"
            icon={RotateCw}
            iconVariant="secondary"
            action={
              accountId ? (
                <Button
                  type="button"
                  variant="contained"
                  startIcon={<Plus size={16} aria-hidden />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  New
                </Button>
              ) : null
            }
          />

          <Stack spacing={2}>
            {loadingRecords ? (
              <Stack spacing={1.5}>
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" height={40} />
              </Stack>
            ) : null}
            {recordsError ? (
              <StatusAlert tone="error">{recordsError}</StatusAlert>
            ) : null}
            {!loadingRecords && !recordsError ? (
              <AppTable
                columns={recordColumns}
                rows={records}
                getRowKey={(record) => record.id}
                emptyMessage={historyEmptyMessage(archivedFilter)}
                toolbar={
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel id="prize-spin-archived-filter-label">
                      Show
                    </InputLabel>
                    <Select
                      labelId="prize-spin-archived-filter-label"
                      label="Show"
                      value={archivedFilter}
                      onChange={(event) => {
                        setArchivedFilter(
                          event.target.value as PrizeSpinArchivedFilter,
                        )
                        setRecordsPage(1)
                      }}
                      sx={inputFieldSx}
                    >
                      <MenuItem value="false">Active</MenuItem>
                      <MenuItem value="true">Archived</MenuItem>
                      <MenuItem value="all">All</MenuItem>
                    </Select>
                  </FormControl>
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
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      {accountId !== undefined ? (
        <PrizeSpinArchiveDialog
          accountId={accountId}
          open={archiveDialogRecord !== null}
          record={archiveDialogRecord}
          onClose={() => setArchiveDialogRecord(null)}
        />
      ) : null}

      {accountId !== undefined ? (
        <PrizeSpinCreateDialog
          accountId={accountId}
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onCreated={() => setRecordsPage(1)}
        />
      ) : null}
    </>
  )
}
