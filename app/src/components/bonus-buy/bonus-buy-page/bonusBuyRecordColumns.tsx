import { Chip, IconButton, type IconButtonProps, Stack } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { alpha, styled } from '@mui/material/styles'
import { Link, type LinkProps } from 'react-router-dom'
import { isBonusBuyActive, type BonusBuyRecord } from '@/api/bonus-buy'
import type { AppTableColumn } from '@/components/AppTable'
import {
  formatBonusBuyUsd,
} from '@/components/bonus-buy/bonus-buy-page/bonus-buy-page-utils'
import { colors, toneChipSx } from '@/theme/colors'

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

const MutedStatusChip = styled(Chip)(({ theme }) => ({
  height: 24,
  fontSize: '0.75rem',
  fontWeight: 500,
  bgcolor: alpha(theme.palette.text.primary, 0.06),
  color: theme.palette.text.secondary,
  border: '1px solid',
  borderColor: alpha(theme.palette.text.primary, 0.1),
}))

const ActionsStack = styled(Stack)({
  justifyContent: 'flex-end',
})

const StyledOpenIconButton = styled(IconButton)<IconButtonProps & LinkProps>(
  ({ theme }) => ({
  backgroundColor: colors.brand[500],
  color: colors.neutral[950],
  borderRadius: theme.shape.borderRadius,
  width: 28,
  height: 28,
  '&:hover': {
    backgroundColor: colors.brand[400],
  },
}),
)

const actionIconSx = { fontSize: 14 } as const

function recordStatusChip(record: BonusBuyRecord) {
  if (isBonusBuyActive(record)) {
    return (
      <Chip
        label="Active"
        size="small"
        sx={toneChipSx(colors.success[400])}
      />
    )
  }

  return <MutedStatusChip label="Archived" size="small" />
}

export function buildBonusBuyRecordColumns(): AppTableColumn<BonusBuyRecord>[] {
  return [
    {
      id: 'name',
      header: 'Name',
      width: '100%',
      sx: nameColumnSx,
      render: (record) => (
        <RecordName ended={!isBonusBuyActive(record)}>{record.name}</RecordName>
      ),
    },
    {
      id: 'startBalance',
      header: 'Start balance',
      width: 120,
      minWidth: 120,
      sx: balanceColumnSx,
      render: (record) => formatBonusBuyUsd(record.startBalance),
    },
    {
      id: 'status',
      header: 'Status',
      width: 108,
      minWidth: 108,
      sx: statusColumnSx,
      render: (record) => recordStatusChip(record),
    },
    {
      id: 'action',
      header: '',
      align: 'right',
      width: 56,
      minWidth: 56,
      sx: actionColumnSx,
      render: (record) => (
        <ActionsStack direction="row" spacing={0.5}>
          <StyledOpenIconButton
            component={Link}
            to={`/bonus-buy/${record.id}`}
            aria-label={`Open ${record.name}`}
            size="small"
          >
            <ArrowForwardIcon sx={actionIconSx} aria-hidden />
          </StyledOpenIconButton>
        </ActionsStack>
      ),
    },
  ]
}
