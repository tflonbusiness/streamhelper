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
import { useTranslation } from 'react-i18next'
import AddIcon from '@mui/icons-material/Add'
import SensorsIcon from '@mui/icons-material/Sensors'
import { styled } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'
import {
  isChatRollArchived,
  type ChatRollArchivedFilter,
  type ChatRollRecord,
} from '@/api/chat-roll'
import { ChatRollArchiveDialog } from '@/components/chat-roll/chat-roll-page/ChatRollArchiveDialog'
import { ChatRollCreateDialog } from '@/components/chat-roll/chat-roll-page/ChatRollCreateDialog'
import { ChatRollHistoryList } from '@/components/chat-roll/chat-roll-page/ChatRollHistoryList'
import { ChatRollHistoryLiveHero } from '@/components/chat-roll/chat-roll-page/ChatRollHistoryLiveHero'
import { formatChatRollLiveSessionHint } from '@/components/chat-roll/chat-roll-page/chat-roll-page-utils'
import { CHAT_ROLL_HISTORY_PAGE_SIZE } from '@/components/chat-roll/chat-roll-page/chat-roll-page-utils'
import { EntitlementNoticesSection } from '@/components/EntitlementNoticesSection'
import { SectionHeader } from '@/components/SectionHeader'
import {
  hasEntitlementEnvelope,
  isAtSessionCap,
  isOverLimit,
  canGoLiveModuleSession,
  type EntitlementEnvelope,
} from '@/lib/entitlements'
import { useNotification } from '@/context/NotificationContext'
import { useChatRolls, useGoLiveChatRoll } from '@/queries/use-chat-rolls'

type ChatRollHistorySectionProps = {
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

function findLiveRecord(records: ChatRollRecord[]): ChatRollRecord | null {
  return (
    records.find(
      (record) => record.status === 'live' && !isChatRollArchived(record),
    ) ?? null
  )
}

export const ChatRollHistorySection = ({
  accountId,
}: ChatRollHistorySectionProps) => {
  const { t } = useTranslation()
  const { showError, showSuccess } = useNotification()
  const goLiveMutation = useGoLiveChatRoll(accountId)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [archiveDialogRecord, setArchiveDialogRecord] =
    useState<ChatRollRecord | null>(null)
  const [archivedFilter, setArchivedFilter] =
    useState<ChatRollArchivedFilter>('false')
  const [recordsPage, setRecordsPage] = useState(1)

  const showLiveHero = archivedFilter !== 'true'

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

  const {
    data: activePeekResult,
    isLoading: loadingLivePeek,
    isFetching: fetchingLivePeek,
  } = useChatRolls(showLiveHero ? accountId : undefined, {
    archived: 'false',
    page: 1,
    limit: LIVE_PEEK_LIMIT,
  })

  const records = recordsResult?.records ?? []
  const listEnvelope: EntitlementEnvelope | undefined = hasEntitlementEnvelope(
    recordsResult,
  )
    ? recordsResult
    : undefined
  const createSessionDisabled =
    isOverLimit(listEnvelope) || isAtSessionCap(listEnvelope, 'chatRoll')
  const recordsTotal =
    typeof recordsResult?.total === 'number'
      ? recordsResult.total
      : records.length

  const liveRecord = useMemo(
    () => (showLiveHero ? findLiveRecord(activePeekResult?.records ?? []) : null),
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
      ? t('chatRoll.noArchived')
      : liveRecord && records.length <= 1 && listRecords.length === 0
        ? t('chatRoll.historyNoOtherSessions')
        : t('chatRoll.noSessions')

  useEffect(() => {
    if (!recordsQueryError) {
      return
    }

    showError(t('chatRoll.couldNotLoadHistory'))
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
            <Stack spacing={0} sx={{ width: '100%' }}>
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
                    disabled={createSessionDisabled}
                  >
                    {t('common.newSession')}
                  </Button>
                }
              />
              <EntitlementNoticesSection
                envelope={listEnvelope}
                module="chatRoll"
              />
            </Stack>
            {showLiveHero ? (
              <ChatRollHistoryLiveHero
                record={liveRecord}
                loading={heroLoading && !liveRecord}
              />
            ) : null}
            <ChatRollHistoryList
              records={listRecords}
              loading={listLoading}
              emptyMessage={listEmptyMessage}
              showArchiveAction={archivedFilter !== 'true'}
              showGoLiveAction={archivedFilter !== 'true'}
              showSectionTitle={showLiveHero}
              goLiveDisabled={!canGoLiveModuleSession(listEnvelope, 'chatRoll')}
              onArchive={setArchiveDialogRecord}
              goLivePendingId={
                goLiveMutation.isPending ? goLiveMutation.variables : undefined
              }
              onGoLive={(record) => {
                goLiveMutation.mutate(record.id, {
                  onSuccess: (updated) =>
                    showSuccess(
                      formatChatRollLiveSessionHint(
                        t,
                        updated.isAcceptingParticipants,
                      ),
                    ),
                  onError: (error) =>
                    showError(
                      error instanceof Error
                        ? error.message
                        : t('chatRoll.couldNotGoLive'),
                    ),
                })
              }}
              toolbar={
                <StyledFilterFormControl size="small">
                  <InputLabel id="chat-roll-archived-filter-label">
                    {t('common.show')}
                  </InputLabel>
                  <StyledFilterSelect
                    labelId="chat-roll-archived-filter-label"
                    label={t('common.show')}
                    value={archivedFilter}
                    onChange={(event) => {
                      setArchivedFilter(
                        event.target.value as ChatRollArchivedFilter,
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
                rowsPerPage: CHAT_ROLL_HISTORY_PAGE_SIZE,
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
