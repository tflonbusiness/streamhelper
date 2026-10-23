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
  GrowingJackpotArchivedFilter,
  GrowingJackpotRecord,
} from '@/api/growing-jackpot'
import { GrowingJackpotArchiveDialog } from '@/components/growing-jackpot/session/GrowingJackpotArchiveDialog'
import { GrowingJackpotCreateDialog } from '@/components/growing-jackpot/growing-jackpot-page/GrowingJackpotCreateDialog'
import { GrowingJackpotHistoryList } from '@/components/growing-jackpot/growing-jackpot-page/GrowingJackpotHistoryList'
import { GrowingJackpotHistoryLiveHero } from '@/components/growing-jackpot/growing-jackpot-page/GrowingJackpotHistoryLiveHero'
import {
  formatGrowingJackpotLiveSessionHint,
  GROWING_JACKPOT_HISTORY_PAGE_SIZE,
} from '@/components/growing-jackpot/growing-jackpot-page/growing-jackpot-page-utils'
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
  useGrowingJackpots,
  useGoLiveGrowingJackpot,
} from '@/queries/use-growing-jackpots'

type GrowingJackpotHistorySectionProps = {
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
  records: GrowingJackpotRecord[],
): GrowingJackpotRecord | null {
  return records.find((r) => r.status === 'live') ?? null
}

export function GrowingJackpotHistorySection({
  accountId,
}: GrowingJackpotHistorySectionProps) {
  const { t } = useTranslation()
  const { showError, showSuccess } = useNotification()
  const goLiveMutation = useGoLiveGrowingJackpot(accountId)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [archiveRecord, setArchiveRecord] =
    useState<GrowingJackpotRecord | null>(null)
  const [archivedFilter, setArchivedFilter] =
    useState<GrowingJackpotArchivedFilter>('false')
  const [recordsPage, setRecordsPage] = useState(1)

  const showLiveHero = archivedFilter !== 'true'

  const {
    data: recordsResult,
    isLoading: loadingRecords,
    isFetching: fetchingRecords,
    error: recordsQueryError,
  } = useGrowingJackpots(accountId, {
    archived: archivedFilter,
    page: recordsPage,
    limit: GROWING_JACKPOT_HISTORY_PAGE_SIZE,
  })

  const {
    data: activePeekResult,
    isLoading: loadingLivePeek,
    isFetching: fetchingLivePeek,
  } = useGrowingJackpots(showLiveHero ? accountId : undefined, {
    archived: 'false',
    page: 1,
    limit: LIVE_PEEK_LIMIT,
  })

  const sessions = recordsResult?.sessions ?? []
  const listEnvelope: EntitlementEnvelope | undefined = hasEntitlementEnvelope(
    recordsResult,
  )
    ? recordsResult
    : undefined
  const createSessionDisabled =
    isOverLimit(listEnvelope) || !canMutateWithEntitlements(listEnvelope)

  const liveRecord = useMemo(
    () =>
      showLiveHero ? findLiveRecord(activePeekResult?.sessions ?? []) : null,
    [activePeekResult?.sessions, showLiveHero],
  )

  const listRecords = useMemo(() => {
    if (!liveRecord) return sessions
    return sessions.filter((s) => s.id !== liveRecord.id)
  }, [liveRecord, sessions])

  const listEmptyMessage =
    archivedFilter === 'true'
      ? t('growingJackpot.noArchivedSessions')
      : liveRecord && sessions.length <= 1 && listRecords.length === 0
        ? t('growingJackpot.historyNoOtherSessions')
        : t('growingJackpot.noSessions')

  useEffect(() => {
    if (recordsQueryError) {
      showError(t('growingJackpot.couldNotLoadHistory'))
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
                iconVariant="success"
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
              <GrowingJackpotHistoryLiveHero
                record={liveRecord}
                loading={heroLoading && !liveRecord}
              />
            ) : null}
            <GrowingJackpotHistoryList
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
                    showSuccess(formatGrowingJackpotLiveSessionHint(t)),
                  onError: (error) =>
                    showError(
                      error instanceof Error
                        ? error.message
                        : t('growingJackpot.couldNotGoLive'),
                    ),
                })
              }}
              toolbar={
                <StyledFilterFormControl size="small">
                  <InputLabel id="growing-jackpot-archived-filter">
                    {t('common.show')}
                  </InputLabel>
                  <Select
                    labelId="growing-jackpot-archived-filter"
                    label={t('common.show')}
                    value={archivedFilter}
                    onChange={(e) => {
                      setArchivedFilter(
                        e.target.value as GrowingJackpotArchivedFilter,
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
                rowsPerPage: GROWING_JACKPOT_HISTORY_PAGE_SIZE,
              }}
            />
          </StyledContentStack>
        </StyledCardContent>
      </StyledCard>
      <GrowingJackpotCreateDialog
        accountId={accountId}
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
      <GrowingJackpotArchiveDialog
        accountId={accountId}
        open={archiveRecord !== null}
        record={archiveRecord}
        onClose={() => setArchiveRecord(null)}
      />
    </>
  )
}
