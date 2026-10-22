import { IconButton, Stack, TableSortLabel, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { styled, type Theme } from '@mui/material/styles'
import type { TFunction } from 'i18next'
import type { FirstReactionDraw } from '@/api/first-reaction'
import type { AppTableColumn } from '@/components/AppTable'
import { StatusToneChip } from '@/components/StatusToneChip'
import {
  firstReactionDrawEndedAt,
  firstReactionDrawOutcome,
  firstReactionDrawOutcomeColor,
} from '@/components/first-reaction/session/first-reaction-draw-history-utils'
import type {
  FirstReactionDrawSortField,
  FirstReactionDrawSortState,
} from '@/components/first-reaction/session/first-reaction-draw-history-sort'
import { formatDateTime } from '@/lib/format-date-time'

const KeywordCell = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  letterSpacing: '-0.02em',
  fontVariantNumeric: 'tabular-nums',
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
  field: FirstReactionDrawSortField,
  sort: FirstReactionDrawSortState,
  onSortField: (field: FirstReactionDrawSortField) => void,
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

function DrawOutcomeChip({ draw, t }: { draw: FirstReactionDraw; t: TFunction }) {
  const outcome = firstReactionDrawOutcome(draw, t)
  return (
    <StatusToneChip
      label={outcome.label}
      color={firstReactionDrawOutcomeColor(outcome.tone)}
    />
  )
}

type BuildFirstReactionDrawHistoryColumnsInput = {
  t: TFunction
  theme: Theme
  locale: string
  sort: FirstReactionDrawSortState
  onSortField: (field: FirstReactionDrawSortField) => void
  readOnly: boolean
  onArchiveDraw: (drawId: number) => void
}

export function buildFirstReactionDrawHistoryColumns(
  input: BuildFirstReactionDrawHistoryColumnsInput,
): AppTableColumn<FirstReactionDraw>[] {
  const { t, theme, locale, sort, onSortField, readOnly, onArchiveDraw } =
    input

  return [
    {
      id: 'index',
      header: sortableHeader('#', 'drawIndex', sort, onSortField, theme),
      width: 56,
      minWidth: 56,
      render: (draw) => (
        <IndexCell variant="body2">
          {t('firstReaction.historyCardIndex', { index: draw.drawIndex })}
        </IndexCell>
      ),
    },
    {
      id: 'keyword',
      header: sortableHeader(
        t('firstReaction.keywordLabel'),
        'keyword',
        sort,
        onSortField,
        theme,
      ),
      width: '28%',
      minWidth: 120,
      render: (draw) => (
        <KeywordCell variant="body2" title={draw.keyword}>
          {draw.keyword}
        </KeywordCell>
      ),
    },
    {
      id: 'outcome',
      header: sortableHeader(
        t('table.status'),
        'outcome',
        sort,
        onSortField,
        theme,
      ),
      width: '22%',
      minWidth: 140,
      render: (draw) => <DrawOutcomeChip draw={draw} t={t} />,
    },
    {
      id: 'winner',
      header: sortableHeader(
        t('common.nick'),
        'winner',
        sort,
        onSortField,
        theme,
      ),
      width: '28%',
      render: (draw) => (
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
          {draw.winnerDisplayName ? (
            <Typography
              variant="body2"
              fontWeight={500}
              noWrap
              title={draw.winnerDisplayName}
            >
              {draw.winnerDisplayName}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('firstReaction.drawHistoryNoWinner')}
            </Typography>
          )}
          {draw.proofToken ? (
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              title={draw.proofToken}
            >
              {t('firstReaction.drawHistoryProofShort', { token: draw.proofToken })}
            </Typography>
          ) : null}
        </Stack>
      ),
    },
    {
      id: 'time',
      header: sortableHeader(
        t('firstReaction.drawHistoryTime'),
        'time',
        sort,
        onSortField,
        theme,
      ),
      align: 'right',
      width: '22%',
      minWidth: 128,
      render: (draw) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
        >
          <time dateTime={firstReactionDrawEndedAt(draw)}>
            {formatDateTime(firstReactionDrawEndedAt(draw), locale)}
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
      render: (draw) =>
        draw.phase === 'closed' ? (
          <DeleteButton
            type="button"
            size="small"
            aria-label={t('firstReaction.removeDrawAria', {
              keyword: draw.keyword,
            })}
            disabled={readOnly}
            onClick={() => onArchiveDraw(draw.id)}
          >
            <DeleteIcon fontSize="small" aria-hidden />
          </DeleteButton>
        ) : null,
    },
  ]
}
