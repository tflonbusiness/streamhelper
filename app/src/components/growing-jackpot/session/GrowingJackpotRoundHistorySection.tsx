import HistoryIcon from '@mui/icons-material/History'
import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { GrowingJackpotRound } from '@/api/growing-jackpot'
import { AppTable, type AppTableColumn } from '@/components/AppTable'
import { SectionHeader, sectionTableIcon } from '@/components/SectionHeader'
import { StatusAlert } from '@/components/StatusAlert'
import {
  StyledSessionCard,
  StyledSessionCardContent,
  StyledSessionSectionChrome,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { useNotification } from '@/context/NotificationContext'
import {
  useGrowingJackpotRounds,
  usePatchGrowingJackpotRoundFulfillment,
} from '@/queries/use-growing-jackpot-session'

const ROUND_HISTORY_PAGE_SIZE = 10

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
  const { t } = useTranslation()
  const { showSuccess } = useNotification()
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching, error } = useGrowingJackpotRounds(
    accountId,
    growingJackpotId,
    page,
    ROUND_HISTORY_PAGE_SIZE,
    { pollWhileAccepting },
  )

  const fulfillmentMutation = usePatchGrowingJackpotRoundFulfillment(
    accountId,
    growingJackpotId,
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
      Math.ceil(data.total / ROUND_HISTORY_PAGE_SIZE) || 1,
    )
    if (page > maxPage) {
      setPage(maxPage)
    }
  }, [data, page])

  const columns = useMemo((): AppTableColumn<GrowingJackpotRound>[] => {
    return [
      {
        id: 'index',
        header: '#',
        width: 48,
        render: (round) => round.roundIndex,
      },
      {
        id: 'keyword',
        header: t('growingJackpot.historyKeyword'),
        render: (round) => round.joinKeyword,
      },
      {
        id: 'result',
        header: t('growingJackpot.historyResult'),
        render: (round) => round.result ?? round.phase,
      },
      {
        id: 'winner',
        header: t('growingJackpot.historyWinner'),
        render: (round) => (
          <Box>
            {round.winnerDisplayName ?? '—'}
            {round.proofToken ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block' }}
              >
                {round.proofToken}
              </Typography>
            ) : null}
          </Box>
        ),
      },
      {
        id: 'fulfillment',
        header: t('growingJackpot.historyFulfillment'),
        render: (round) => {
          if (round.result !== 'won') {
            return '—'
          }
          if (round.fulfillmentStatus === 'fulfilled') {
            return (
              <Chip
                size="small"
                color="success"
                label={t('growingJackpot.fulfillmentFulfilled')}
              />
            )
          }
          return (
            <Button
              size="small"
              variant="outlined"
              disabled={readOnly || fulfillmentMutation.isPending}
              onClick={() =>
                fulfillmentMutation.mutate(
                  { roundId: round.id, status: 'fulfilled' },
                  {
                    onSuccess: () =>
                      showSuccess(t('growingJackpot.fulfillmentMarked')),
                  },
                )
              }
            >
              {t('growingJackpot.markFulfilled')}
            </Button>
          )
        },
      },
    ]
  }, [fulfillmentMutation, readOnly, showSuccess, t])

  return (
    <StyledSessionCard elevation={0}>
      <StyledSessionCardContent>
        <Stack spacing={2}>
          <StyledSessionSectionChrome>
            <SectionHeader
              title={t('growingJackpot.roundHistoryTitle')}
              icon={total > 0 ? sectionTableIcon : HistoryIcon}
              iconVariant={total > 0 ? 'secondary' : 'info'}
              showDivider={false}
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
                  rowsPerPage: ROUND_HISTORY_PAGE_SIZE,
                }}
              />
            </Box>
          ) : null}
        </Stack>
      </StyledSessionCardContent>
    </StyledSessionCard>
  )
}
