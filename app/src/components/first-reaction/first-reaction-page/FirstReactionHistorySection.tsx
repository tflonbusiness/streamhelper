import AddIcon from '@mui/icons-material/Add'
import SensorsIcon from '@mui/icons-material/Sensors'
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
import { styled } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  FirstReactionArchivedFilter,
  FirstReactionRecord,
} from '@/api/first-reaction'
import { FirstReactionArchiveDialog } from '@/components/first-reaction/first-reaction-page/FirstReactionArchiveDialog'
import { FirstReactionCreateDialog } from '@/components/first-reaction/first-reaction-page/FirstReactionCreateDialog'
import { FirstReactionHistoryList } from '@/components/first-reaction/first-reaction-page/FirstReactionHistoryList'
import { FirstReactionHistoryLiveHero } from '@/components/first-reaction/first-reaction-page/FirstReactionHistoryLiveHero'
import { FIRST_REACTION_HISTORY_PAGE_SIZE } from '@/components/first-reaction/first-reaction-page/first-reaction-page-utils'
import { EntitlementNoticesSection } from '@/components/EntitlementNoticesSection'
import { SectionHeader } from '@/components/SectionHeader'
import {
  canMutateWithEntitlements,
  hasEntitlementEnvelope,
  isOverLimit,
  type EntitlementEnvelope,
} from '@/lib/entitlements'
import { useNotification } from '@/context/NotificationContext'
import {
  useFirstReactions,
  useGoLiveFirstReaction,
} from '@/queries/use-first-reactions'
import { formatFirstReactionLiveSessionHint } from './first-reaction-page-utils'

type FirstReactionHistorySectionProps = {
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

function findLiveRecord(
  records: FirstReactionRecord[],
): FirstReactionRecord | null {
  return records.find((r) => r.status === 'live') ?? null
}

export function FirstReactionHistorySection({
  accountId,
}: FirstReactionHistorySectionProps) {
  const { t } = useTranslation()
  const { showError, showSuccess } = useNotification()
  const goLiveMutation = useGoLiveFirstReaction(accountId)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [archiveRecord, setArchiveRecord] =
    useState<FirstReactionRecord | null>(null)
  const [archivedFilter, setArchivedFilter] =
    useState<FirstReactionArchivedFilter>('false')
  const [recordsPage, setRecordsPage] = useState(1)

  const showLiveHero = archivedFilter !== 'true'

  const {
    data: recordsResult,
    isLoading: loadingRecords,
    isFetching: fetchingRecords,
    error: recordsQueryError,
  } = useFirstReactions(accountId, {
    archived: archivedFilter,
    page: recordsPage,
    limit: FIRST_REACTION_HISTORY_PAGE_SIZE,
  })

  const {
    data: activePeekResult,
    isLoading: loadingLivePeek,
    isFetching: fetchingLivePeek,
  } = useFirstReactions(showLiveHero ? accountId : undefined, {
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
    isOverLimit(listEnvelope) || !canMutateWithEntitlements(listEnvelope)

  const liveRecord = useMemo(
    () =>
      showLiveHero ? findLiveRecord(activePeekResult?.records ?? []) : null,
    [activePeekResult?.records, showLiveHero],
  )

  const listRecords = useMemo(() => {
    if (!liveRecord) return records
    return records.filter((r) => r.id !== liveRecord.id)
  }, [liveRecord, records])

  const listEmptyMessage =
    archivedFilter === 'true'
      ? t('firstReaction.noArchivedSessions')
      : liveRecord && records.length <= 1 && listRecords.length === 0
        ? t('firstReaction.historyNoOtherSessions')
        : t('firstReaction.noSessions')

  useEffect(() => {
    if (recordsQueryError) {
      showError(t('firstReaction.couldNotLoadHistory'))
    }
  }, [recordsQueryError, showError, t])

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
              <EntitlementNoticesSection envelope={listEnvelope} />
            </Stack>
            {showLiveHero ? (
              <FirstReactionHistoryLiveHero
                record={liveRecord}
                loading={heroLoading && !liveRecord}
              />
            ) : null}
            <FirstReactionHistoryList
              records={listRecords}
              loading={listLoading}
              emptyMessage={listEmptyMessage}
              showArchiveAction={archivedFilter !== 'true'}
              showGoLiveAction={archivedFilter !== 'true'}
              showSectionTitle={showLiveHero}
              goLivePendingId={
                goLiveMutation.isPending
                  ? goLiveMutation.variables
                  : undefined
              }
              goLiveDisabled={!canMutateWithEntitlements(listEnvelope)}
              onArchive={setArchiveRecord}
              onGoLive={(record) => {
                goLiveMutation.mutate(record.id, {
                  onSuccess: () =>
                    showSuccess(formatFirstReactionLiveSessionHint(t)),
                  onError: (error) =>
                    showError(
                      error instanceof Error
                        ? error.message
                        : t('firstReaction.couldNotGoLive'),
                    ),
                })
              }}
              toolbar={
                <StyledFilterFormControl size="small">
                  <InputLabel id="first-reaction-archived-filter">
                    {t('common.show')}
                  </InputLabel>
                  <Select
                    labelId="first-reaction-archived-filter"
                    label={t('common.show')}
                    value={archivedFilter}
                    onChange={(e) => {
                      setArchivedFilter(
                        e.target.value as FirstReactionArchivedFilter,
                      )
                      setRecordsPage(1)
                    }}
                  >
                    <MenuItem value="false">{t('common.active')}</MenuItem>
                    <MenuItem value="true">{t('table.archived')}</MenuItem>
                    <MenuItem value="all">{t('common.all')}</MenuItem>
                  </Select>
                </StyledFilterFormControl>
              }
              pagination={{
                count: recordsResult?.total ?? 0,
                page: recordsPage,
                onPageChange: setRecordsPage,
                rowsPerPage: FIRST_REACTION_HISTORY_PAGE_SIZE,
              }}
            />
          </StyledContentStack>
        </StyledCardContent>
      </StyledCard>
      <FirstReactionCreateDialog
        accountId={accountId}
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
      <FirstReactionArchiveDialog
        accountId={accountId}
        open={archiveRecord !== null}
        record={archiveRecord}
        onClose={() => setArchiveRecord(null)}
      />
    </>
  )
}
