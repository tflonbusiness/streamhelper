import { Chip, Stack, TableSortLabel, Typography } from '@mui/material'
import type { Theme } from '@mui/material/styles'
import type { TFunction } from 'i18next'
import type {
  SubscriptionAdminSearchItem,
  SubscriptionAdminSortField,
  SubscriptionAdminSortOrder,
} from '@/api/internal-subscriptions'
import type { AppTableColumn } from '@/components/AppTable'
import { mutedChipSx, toneChipSx } from '@/theme/colors'

export type SubscriptionAdminSortState = {
  field: SubscriptionAdminSortField
  direction: SubscriptionAdminSortOrder
}

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
  field: SubscriptionAdminSortField,
  sort: SubscriptionAdminSortState,
  onSortField: (field: SubscriptionAdminSortField) => void,
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

function formatEndsAt(value: string | null | undefined, locale: string): string {
  if (!value) {
    return '—'
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return '—'
  }
  return parsed.toLocaleString(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function AccessChip({
  row,
  t,
  theme,
}: {
  row: SubscriptionAdminSearchItem
  t: TFunction
  theme: Theme
}) {
  const hasAccess = row.subscription.hasAccess === true
  if (!hasAccess) {
    return (
      <Chip
        label={t('subscriptionAdmin.chipNoAccess')}
        size="small"
        sx={mutedChipSx(theme)}
      />
    )
  }
  if (row.subscription.planTier === 'trial') {
    return (
      <Chip
        label={t('subscriptionAdmin.chipTrial')}
        size="small"
        sx={toneChipSx(theme.palette.info.light)}
      />
    )
  }
  return (
    <Chip
      label={t('subscriptionAdmin.chipPaid', { plan: row.subscriptionPlan })}
      size="small"
      sx={toneChipSx(theme.palette.success.light)}
    />
  )
}

type BuildColumnsInput = {
  t: TFunction
  theme: Theme
  locale: string
  sort: SubscriptionAdminSortState
  onSortField: (field: SubscriptionAdminSortField) => void
}

export function buildSubscriptionAdminTableColumns(
  input: BuildColumnsInput,
): AppTableColumn<SubscriptionAdminSearchItem>[] {
  const { t, theme, locale, sort, onSortField } = input

  return [
    {
      id: 'accountId',
      header: sortableHeader(
        t('subscriptionAdmin.columnAccountId'),
        'accountId',
        sort,
        onSortField,
        theme,
      ),
      width: 88,
      render: (row) => (
        <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
          {row.accountId}
        </Typography>
      ),
    },
    {
      id: 'name',
      header: sortableHeader(
        t('subscriptionAdmin.columnName'),
        'name',
        sort,
        onSortField,
        theme,
      ),
      minWidth: 140,
      render: (row) => (
        <Stack spacing={0.25}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
          >
            {row.ucid}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'channelSlug',
      header: sortableHeader(
        t('subscriptionAdmin.columnChannel'),
        'channelSlug',
        sort,
        onSortField,
        theme,
      ),
      minWidth: 100,
      render: (row) =>
        row.channelSlug ? `@${row.channelSlug}` : (
          <Typography variant="body2" color="text.secondary">—</Typography>
        ),
    },
    {
      id: 'subscriptionPlan',
      header: sortableHeader(
        t('subscriptionAdmin.columnPlan'),
        'subscriptionPlan',
        sort,
        onSortField,
        theme,
      ),
      width: 96,
      render: (row) => row.subscriptionPlan,
    },
    {
      id: 'access',
      header: t('subscriptionAdmin.columnAccess'),
      width: 120,
      render: (row) => <AccessChip row={row} t={t} theme={theme} />,
    },
    {
      id: 'endsAt',
      header: sortableHeader(
        t('subscriptionAdmin.columnEndsAt'),
        'endsAt',
        sort,
        onSortField,
        theme,
      ),
      width: 140,
      render: (row) => formatEndsAt(row.subscription.endsAt, locale),
    },
  ]
}
