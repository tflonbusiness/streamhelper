import DeleteIcon from '@mui/icons-material/Delete'
import { IconButton, Stack, TableSortLabel, Typography } from '@mui/material'
import { styled, type Theme } from '@mui/material/styles'
import type { TFunction } from 'i18next'
import type { GrowingJackpotRound } from '@/api/growing-jackpot'
import type { AppTableColumn } from '@/components/AppTable'
import {
  growingJackpotRoundEndedAt,
  growingJackpotRoundOutcomeLabel,
} from '@/components/growing-jackpot/session/growing-jackpot-round-history-utils'
import type {
  GrowingJackpotRoundSortField,
  GrowingJackpotRoundSortState,
} from '@/components/growing-jackpot/session/growing-jackpot-round-history-sort'
import { formatDateTime } from '@/lib/format-date-time'

const KeywordCell = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  letterSpacing: '-0.02em',
  color: theme.palette.text.primary,
}))

const IndexCell = styled(Typography)(({ theme }) => ({
  fontVariantNumeric: 'tabular-nums',
  color: theme.palette.text.secondary,
  fontWeight: 500,
}))

const DeleteButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.error.main,
}))

const sortableHeaderIconSx = (theme: Theme, active: boolean) => ({
  color: 'inherit',
  '& .MuiTableSortLabel-icon': {
    opacity: active ? 1 : 0.45,
    color: theme.palette.text.secondary,
  },
  '&:hover .MuiTableSortLabel-icon': {
    opacity: active ? 1 : 0.7,
  },
})

function sortableHeader(
  label: string,
  field: GrowingJackpotRoundSortField,
  sort: GrowingJackpotRoundSortState,
  onSortField: (field: GrowingJackpotRoundSortField) => void,
  theme: Theme,
) {
  const active = sort.field === field

  return (
    <TableSortLabel
      active={active}
      direction={active ? sort.direction : 'asc'}
      onClick={() => onSortField(field)}
      sx={sortableHeaderIconSx(theme, active)}
    >
      {label}
    </TableSortLabel>
  )
}

type BuildGrowingJackpotRoundHistoryColumnsInput = {
  t: TFunction
  theme: Theme
  locale: string
  sort: GrowingJackpotRoundSortState
  onSortField: (field: GrowingJackpotRoundSortField) => void
  readOnly: boolean
  onArchiveRound: (roundId: number) => void
}

export function buildGrowingJackpotRoundHistoryColumns(
  input: BuildGrowingJackpotRoundHistoryColumnsInput,
): AppTableColumn<GrowingJackpotRound>[] {
  const { t, theme, locale, sort, onSortField, readOnly, onArchiveRound } =
    input

  return [
    {
      id: 'index',
      header: sortableHeader('#', 'roundIndex', sort, onSortField, theme),
      width: 56,
      minWidth: 56,
      render: (round) => (
        <IndexCell variant="body2">
          {t('growingJackpot.historyCardIndex', { index: round.roundIndex })}
        </IndexCell>
      ),
    },
    {
      id: 'keyword',
      header: sortableHeader(
        t('growingJackpot.historyKeyword'),
        'keyword',
        sort,
        onSortField,
        theme,
      ),
      width: '24%',
      minWidth: 120,
      render: (round) => (
        <KeywordCell variant="body2" title={round.joinKeyword}>
          {round.joinKeyword}
        </KeywordCell>
      ),
    },
    {
      id: 'outcome',
      header: sortableHeader(
        t('growingJackpot.historyResult'),
        'outcome',
        sort,
        onSortField,
        theme,
      ),
      width: '22%',
      minWidth: 140,
      render: (round) => (
        <Typography variant="body2">
          {growingJackpotRoundOutcomeLabel(round, t)}
        </Typography>
      ),
    },
    {
      id: 'winner',
      header: sortableHeader(
        t('growingJackpot.historyWinner'),
        'winner',
        sort,
        onSortField,
        theme,
      ),
      width: '26%',
      render: (round) => (
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
          {round.winnerDisplayName ? (
            <Typography
              variant="body2"
              fontWeight={500}
              noWrap
              title={round.winnerDisplayName}
            >
              {round.winnerDisplayName}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('growingJackpot.roundHistoryNoWinner')}
            </Typography>
          )}
          {round.proofToken ? (
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              title={round.proofToken}
            >
              {t('growingJackpot.roundHistoryProofShort', {
                token: round.proofToken,
              })}
            </Typography>
          ) : null}
        </Stack>
      ),
    },
    {
      id: 'time',
      header: sortableHeader(
        t('growingJackpot.roundHistoryTime'),
        'time',
        sort,
        onSortField,
        theme,
      ),
      align: 'right',
      width: '22%',
      minWidth: 128,
      render: (round) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
        >
          <time dateTime={growingJackpotRoundEndedAt(round)}>
            {formatDateTime(growingJackpotRoundEndedAt(round), locale)}
          </time>
        </Typography>
      ),
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      width: 48,
      minWidth: 48,
      render: (round) =>
        round.phase === 'closed' ? (
          <DeleteButton
            type="button"
            size="small"
            aria-label={t('growingJackpot.removeRoundAria', {
              keyword: round.joinKeyword,
            })}
            disabled={readOnly}
            onClick={() => onArchiveRound(round.id)}
          >
            <DeleteIcon fontSize="small" aria-hidden />
          </DeleteButton>
        ) : null,
    },
  ]
}
