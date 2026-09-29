import { Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { TFunction } from 'i18next'
import { isBonusBuyArchived, type BonusBuyRecord } from '@/api/bonus-buy'
import { bonusBuyHistoryStatusChip } from '@/components/bonus-buy/bonus-buy-page/bonusBuyHistoryStatusChip'
import type { AppTableColumn } from '@/components/AppTable'
import { OpenSessionButton } from '@/components/OpenSessionButton'
import {
  formatBonusBuyUsd,
} from '@/components/bonus-buy/bonus-buy-page/bonus-buy-page-utils'
import { bonusBuySessionRoute } from '@/lib/routes'

const nameColumnSx = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const

const balanceColumnSx = {
  whiteSpace: 'nowrap',
} as const

const statusColumnSx = {
  px: 1.5,
  whiteSpace: 'nowrap',
} as const

const actionColumnSx = {
  px: 1,
  whiteSpace: 'nowrap',
} as const

const RecordName = styled('span', {
  shouldForwardProp: (prop) => prop !== 'ended',
})<{ ended?: boolean }>(({ theme, ended }) => ({
  ...theme.typography.body2,
  fontWeight: 500,
  color: ended ? theme.palette.text.secondary : theme.palette.text.primary,
}))

const ActionsStack = styled(Stack)({
  justifyContent: 'flex-end',
})

function recordStatusChip(record: BonusBuyRecord, t: TFunction) {
  return bonusBuyHistoryStatusChip(record, t)
}

export function buildBonusBuyRecordColumns(
  t: TFunction,
): AppTableColumn<BonusBuyRecord>[] {
  return [
    {
      id: 'name',
      header: t('table.name'),
      width: '100%',
      sx: nameColumnSx,
      render: (record) => (
        <RecordName ended={isBonusBuyArchived(record)}>{record.name}</RecordName>
      ),
    },
    {
      id: 'startBalance',
      header: t('table.startBalance'),
      width: 120,
      minWidth: 120,
      sx: balanceColumnSx,
      render: (record) =>
        formatBonusBuyUsd(record.startBalance, record.currencyCode),
    },
    {
      id: 'status',
      header: t('table.status'),
      width: 108,
      minWidth: 108,
      sx: statusColumnSx,
      render: (record) => recordStatusChip(record, t),
    },
    {
      id: 'action',
      header: '',
      align: 'right',
      width: 168,
      minWidth: 168,
      sx: actionColumnSx,
      render: (record) => (
        <ActionsStack direction="row" spacing={0.5}>
          <OpenSessionButton
            to={bonusBuySessionRoute(record.id)}
            aria-label={t('table.openNameAria', { name: record.name })}
          />
        </ActionsStack>
      ),
    },
  ]
}
