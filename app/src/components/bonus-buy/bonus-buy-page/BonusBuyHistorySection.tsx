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
import { type BonusBuyArchivedFilter } from '@/api/bonus-buy'
import { AppTable } from '@/components/AppTable'
import { BonusBuyCreateDialog } from '@/components/bonus-buy/bonus-buy-page/BonusBuyCreateDialog'
import { BonusBuyRecordExpandedDetails } from '@/components/bonus-buy/bonus-buy-page/BonusBuyRecordExpandedDetails'
import {
  BONUS_BUY_HISTORY_PAGE_SIZE,
  historyEmptyMessage,
} from '@/components/bonus-buy/bonus-buy-page/bonus-buy-page-utils'
import { buildBonusBuyRecordColumns } from '@/components/bonus-buy/bonus-buy-page/bonusBuyRecordColumns'
import { SectionHeader, sectionTableIcon } from '@/components/SectionHeader'
import { useNotification } from '@/context/NotificationContext'
import { useBonusBuys } from '@/queries/use-bonus-buy'

type BonusBuyHistorySectionProps = {
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

export const BonusBuyHistorySection = ({
  accountId,
}: BonusBuyHistorySectionProps) => {
  const { showError } = useNotification()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [expandedRecordIds, setExpandedRecordIds] = useState<Set<number>>(
    new Set(),
  )
  const [archivedFilter, setArchivedFilter] =
    useState<BonusBuyArchivedFilter>('false')
  const [recordsPage, setRecordsPage] = useState(1)

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

  const records = recordsResult?.records ?? []
  const recordsTotal =
    typeof recordsResult?.total === 'number'
      ? recordsResult.total
      : records.length

  useEffect(() => {
    if (!recordsQueryError) {
      return
    }

    showError('Could not load bonus buy history.')
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

  const recordColumns = buildBonusBuyRecordColumns()

  return (
    <>
      <StyledCard elevation={0}>
        <StyledCardContent>
          <SectionHeader
            title="History"
            description="Bonus buy sessions for this account"
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
                  <InputLabel id="bonus-buy-archived-filter-label">
                    Show
                  </InputLabel>
                  <StyledFilterSelect
                    labelId="bonus-buy-archived-filter-label"
                    label="Show"
                    value={archivedFilter}
                    onChange={(event) => {
                      setArchivedFilter(
                        event.target.value as BonusBuyArchivedFilter,
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
              pagination={{
                count: recordsTotal,
                page: recordsPage,
                onPageChange: setRecordsPage,
                rowsPerPage: BONUS_BUY_HISTORY_PAGE_SIZE,
              }}
              expandable={{
                isExpanded: (record) => expandedRecordIds.has(record.id),
                onToggle: (record) => toggleRecordExpanded(record.id),
                ariaLabel: (record) =>
                  expandedRecordIds.has(record.id)
                    ? `Collapse details for ${record.name}`
                    : `Expand details for ${record.name}`,
                renderDetail: (record) => (
                  <BonusBuyRecordExpandedDetails record={record} />
                ),
              }}
            />
          </StyledContentStack>
        </StyledCardContent>
      </StyledCard>
      <BonusBuyCreateDialog
        accountId={accountId}
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={() => setRecordsPage(1)}
      />
    </>
  )
}
