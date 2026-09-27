import { Button, Card, CardContent, Stack } from '@mui/material'
import { useTranslation } from 'react-i18next'
import AddIcon from '@mui/icons-material/Add'
import { styled } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import type { ChatRollRecord } from '@/api/chat-roll'
import { AppTable } from '@/components/AppTable'
import { ChatRollArchiveDialog } from '@/components/chat-roll/chat-roll-page/ChatRollArchiveDialog'
import { ChatRollCreateDialog } from '@/components/chat-roll/chat-roll-page/ChatRollCreateDialog'
import { ChatRollRecordExpandedDetails } from '@/components/chat-roll/chat-roll-page/ChatRollRecordExpandedDetails'
import { CHAT_ROLL_HISTORY_PAGE_SIZE } from '@/components/chat-roll/chat-roll-page/chat-roll-page-utils'
import { buildChatRollRecordColumns } from '@/components/chat-roll/chat-roll-page/chatRollRecordColumns'
import { SectionHeader, sectionTableIcon } from '@/components/SectionHeader'
import { useNotification } from '@/context/NotificationContext'
import { useChatRolls } from '@/queries/use-chat-rolls'

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

export const ChatRollHistorySection = ({
  accountId,
}: ChatRollHistorySectionProps) => {
  const { t } = useTranslation()
  const { showError } = useNotification()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [expandedRecordIds, setExpandedRecordIds] = useState<Set<number>>(
    new Set(),
  )
  const [archiveDialogRecord, setArchiveDialogRecord] =
    useState<ChatRollRecord | null>(null)
  const [recordsPage, setRecordsPage] = useState(1)

  const {
    data: recordsResult,
    isLoading: loadingRecords,
    isFetching: fetchingRecords,
    error: recordsQueryError,
  } = useChatRolls(accountId, {
    archived: 'false',
    page: recordsPage,
    limit: CHAT_ROLL_HISTORY_PAGE_SIZE,
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

    showError(t('chatRoll.couldNotLoadHistory'))
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

  const recordColumns = buildChatRollRecordColumns(t, {
    onArchive: setArchiveDialogRecord,
  })

  return (
    <>
      <StyledCard elevation={0}>
        <StyledCardContent>
          <SectionHeader
            title={t('chatRoll.historyTitle')}
            description={t('chatRoll.historyDescription')}
            icon={sectionTableIcon}
            iconVariant="secondary"
            action={
              <Button
                type="button"
                variant="contained"
                startIcon={<AddIcon fontSize="small" />}
                onClick={() => setCreateDialogOpen(true)}
              >
                {t('common.newSession')}
              </Button>
            }
          />
          <StyledContentStack>
            <AppTable
              columns={recordColumns}
              rows={records}
              loading={loadingRecords || fetchingRecords}
              getRowKey={(record) => record.id}
              emptyMessage={t('chatRoll.noSessions')}
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
                    ? t('table.collapseDetailsAria', { title: record.title })
                    : t('table.expandDetailsAria', { title: record.title }),
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
