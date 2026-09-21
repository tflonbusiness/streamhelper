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
  isChatRollLive,
  type ChatRollArchivedFilter,
  type ChatRollRecord,
} from '@/api/chat-roll'
import { AppTable } from '@/components/AppTable'
import { ChatRollArchiveDialog } from '@/components/chat-roll/chat-roll-page/ChatRollArchiveDialog'
import { ChatRollCreateDialog } from '@/components/chat-roll/chat-roll-page/ChatRollCreateDialog'
import { ChatRollRecordExpandedDetails } from '@/components/chat-roll/chat-roll-page/ChatRollRecordExpandedDetails'
import {
  CHAT_ROLL_HISTORY_PAGE_SIZE,
  historyEmptyMessage,
  liveSessionRowSx,
} from '@/components/chat-roll/chat-roll-page/chat-roll-page-utils'
import { buildChatRollRecordColumns } from '@/components/chat-roll/chat-roll-page/chatRollRecordColumns'
import { SectionHeader, sectionTableIcon } from '@/components/SectionHeader'
import { useNotification } from '@/context/NotificationContext'
import {
  useDeactivateChatRoll,
  useGoLiveChatRoll,
  useChatRolls,
} from '@/queries/use-chat-rolls'

type ChatRollHistorySectionProps = {
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

export const ChatRollHistorySection = ({
  accountId,
}: ChatRollHistorySectionProps) => {
  const theme = useTheme()
  const { showSuccess, showError } = useNotification()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [expandedRecordIds, setExpandedRecordIds] = useState<Set<number>>(
    new Set(),
  )
  const [archiveDialogRecord, setArchiveDialogRecord] =
    useState<ChatRollRecord | null>(null)
  const [archivedFilter, setArchivedFilter] =
    useState<ChatRollArchivedFilter>('false')
  const [recordsPage, setRecordsPage] = useState(1)

  const {
    data: recordsResult,
    isLoading: loadingRecords,
    isFetching: fetchingRecords,
    error: recordsQueryError,
  } = useChatRolls(accountId, {
    archived: archivedFilter,
    page: recordsPage,
    limit: CHAT_ROLL_HISTORY_PAGE_SIZE,
  })

  const goLiveMutation = useGoLiveChatRoll(accountId)
  const deactivateMutation = useDeactivateChatRoll(accountId)

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

    showError('Could not load chat roll history.')
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

  const handleGoLive = (record: ChatRollRecord) => {
    goLiveMutation.reset()
    deactivateMutation.reset()
    goLiveMutation.mutate(record.id, {
      onSuccess: () => showSuccess('Session is now live.'),
      onError: (error) => {
        showError(error instanceof Error ? error.message : 'Could not go live')
      },
    })
  }

  const handleDeactivate = (record: ChatRollRecord) => {
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

  const recordColumns = buildChatRollRecordColumns({
    liveActionRecordId,
    onGoLive: handleGoLive,
    onDeactivate: handleDeactivate,
    onArchive: setArchiveDialogRecord,
  })

  return (
    <>
      <StyledCard elevation={0}>
        <StyledCardContent>
          <SectionHeader
            title="History"
            description="Chat roll sessions for this account"
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
                  <InputLabel id="chat-roll-archived-filter-label">
                    Show
                  </InputLabel>
                  <StyledFilterSelect
                    labelId="chat-roll-archived-filter-label"
                    label="Show"
                    value={archivedFilter}
                    onChange={(event) => {
                      setArchivedFilter(
                        event.target.value as ChatRollArchivedFilter,
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
                isChatRollLive(record) ? liveSessionRowSx(theme) : undefined
              }
              pagination={{
                count: recordsTotal,
                page: recordsPage,
                onPageChange: setRecordsPage,
                rowsPerPage: CHAT_ROLL_HISTORY_PAGE_SIZE,
              }}
              expandable={{
                isExpanded: (record) => expandedRecordIds.has(record.id),
                onToggle: (record) => {
                  setExpandedRecordIds((previous) => {
                    const next = new Set(previous)
                    if (next.has(record.id)) {
                      next.delete(record.id)
                    } else {
                      next.add(record.id)
                    }
                    return next
                  })
                },
                ariaLabel: (record) =>
                  expandedRecordIds.has(record.id)
                    ? `Collapse details for ${record.title}`
                    : `Expand details for ${record.title}`,
                renderDetail: (record) => (
                  <ChatRollRecordExpandedDetails record={record} />
                ),
              }}
            />
          </StyledContentStack>
        </StyledCardContent>
      </StyledCard>
      <ChatRollArchiveDialog
        accountId={accountId}
        open={!!archiveDialogRecord}
        record={archiveDialogRecord}
        onClose={() => setArchiveDialogRecord(null)}
      />
      <ChatRollCreateDialog
        accountId={accountId}
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={() => setRecordsPage(1)}
      />
    </>
  )
}
