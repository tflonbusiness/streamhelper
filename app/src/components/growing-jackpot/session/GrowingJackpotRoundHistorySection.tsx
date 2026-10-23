import ArchiveIcon from '@mui/icons-material/Archive'
import HistoryIcon from '@mui/icons-material/History'
import { Box, Button, Stack } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppTable } from '@/components/AppTable'
import { GrowingJackpotArchiveAllRoundsDialog } from '@/components/growing-jackpot/session/GrowingJackpotArchiveAllRoundsDialog'
import { buildGrowingJackpotRoundHistoryColumns } from '@/components/growing-jackpot/session/growingJackpotRoundHistoryColumns'
import {
  DEFAULT_GROWING_JACKPOT_ROUND_SORT,
  GROWING_JACKPOT_ROUND_HISTORY_PAGE_SIZE,
  toGrowingJackpotRoundListParams,
  type GrowingJackpotRoundSortField,
  type GrowingJackpotRoundSortState,
} from '@/components/growing-jackpot/session/growing-jackpot-round-history-sort'
import { SectionHeader, sectionTableIcon } from '@/components/SectionHeader'
import { StatusAlert } from '@/components/StatusAlert'
import {
  StyledSessionCard,
  StyledSessionCardContent,
  StyledSessionSectionChrome,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { useNotification } from '@/context/NotificationContext'
import {
  useArchiveGrowingJackpotRound,
  useGrowingJackpotRounds,
} from '@/queries/use-growing-jackpot-session'

type GrowingJackpotRoundHistorySectionProps = {
  accountId: number
  growingJackpotId: number
  readOnly: boolean
  pollWhileAccepting?: boolean
}

export function GrowingJackpotRoundHistorySection({
  accountId,
  growingJackpotId,
  readOnly,
  pollWhileAccepting = false,
}: GrowingJackpotRoundHistorySectionProps) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const locale = i18n.language
  const { showSuccess, showError } = useNotification()
  const [archiveAllDialogOpen, setArchiveAllDialogOpen] = useState(false)

  const archiveRoundMutation = useArchiveGrowingJackpotRound(
    accountId,
    growingJackpotId,
  )

  const [sort, setSort] = useState<GrowingJackpotRoundSortState>(
    DEFAULT_GROWING_JACKPOT_ROUND_SORT,
  )
  const [page, setPage] = useState(1)

  const listParams = useMemo(
    () => toGrowingJackpotRoundListParams(page, sort),
    [page, sort],
  )

  const { data, isLoading, isFetching, error } = useGrowingJackpotRounds(
    accountId,
    growingJackpotId,
    listParams,
    { pollWhileAccepting },
  )

  const rounds = data?.rounds ?? []
  const total = data?.total ?? 0
  const showInitialLoading = isLoading && !data

  useEffect(() => {
    if (!data) {
      return
    }
    const maxPage = Math.max(
      1,
      Math.ceil(data.total / GROWING_JACKPOT_ROUND_HISTORY_PAGE_SIZE) || 1,
    )
    if (page > maxPage) {
      setPage(maxPage)
    }
  }, [data, page])

  const handleSortField = useCallback((field: GrowingJackpotRoundSortField) => {
    setSort((previous) => {
      if (previous.field === field) {
        return {
          field,
          direction: previous.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      return { field, direction: 'asc' }
    })
    setPage(1)
  }, [])

  const handleArchiveRound = useCallback(
    (roundId: number) => {
      archiveRoundMutation.mutate(roundId, {
        onSuccess: () => showSuccess(t('growingJackpot.roundRemoved')),
        onError: (error) => {
          showError(
            error instanceof Error
              ? error.message
              : t('growingJackpot.couldNotRemoveRound'),
          )
        },
      })
    },
    [archiveRoundMutation, showError, showSuccess, t],
  )

  const columns = useMemo(
    () =>
      buildGrowingJackpotRoundHistoryColumns({
        t,
        theme,
        locale,
        sort,
        onSortField: handleSortField,
        readOnly,
        onArchiveRound: handleArchiveRound,
      }),
    [handleArchiveRound, handleSortField, locale, readOnly, sort, t, theme],
  )

  const archivableCount = rounds.filter((round) => round.phase === 'closed').length

  return (
    <>
      <StyledSessionCard elevation={0}>
        <StyledSessionCardContent>
          <Stack spacing={2}>
            <StyledSessionSectionChrome>
              <SectionHeader
                title={t('growingJackpot.roundHistoryTitle', { count: total })}
                icon={total > 0 ? sectionTableIcon : HistoryIcon}
                iconVariant={total > 0 ? 'secondary' : 'info'}
                showDivider={false}
                action={
                  archivableCount > 0 ? (
                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      startIcon={<ArchiveIcon fontSize="small" aria-hidden />}
                      disabled={readOnly}
                      onClick={() => setArchiveAllDialogOpen(true)}
                    >
                      {t('growingJackpot.archiveAllRounds')}
                    </Button>
                  ) : undefined
                }
              />
            </StyledSessionSectionChrome>
            {error ? (
              <StatusAlert tone="error">
                {error instanceof Error
                  ? error.message
                  : t('growingJackpot.couldNotLoadRoundHistory')}
              </StatusAlert>
            ) : null}
            {!error && total === 0 && !showInitialLoading ? (
              <StatusAlert tone="info">{t('growingJackpot.noRounds')}</StatusAlert>
            ) : null}
            {!error && (total > 0 || showInitialLoading) ? (
              <Box sx={{ minWidth: 0, overflowX: 'auto' }}>
                <AppTable
                  columns={columns}
                  rows={rounds}
                  getRowKey={(round) => round.id}
                  loading={showInitialLoading || isFetching}
                  pagination={{
                    count: total,
                    page,
                    onPageChange: setPage,
                    rowsPerPage: GROWING_JACKPOT_ROUND_HISTORY_PAGE_SIZE,
                  }}
                />
              </Box>
            ) : null}
          </Stack>
        </StyledSessionCardContent>
      </StyledSessionCard>
      <GrowingJackpotArchiveAllRoundsDialog
        accountId={accountId}
        growingJackpotId={growingJackpotId}
        roundCount={archivableCount}
        open={archiveAllDialogOpen}
        onClose={() => setArchiveAllDialogOpen(false)}
      />
    </>
  )
}
