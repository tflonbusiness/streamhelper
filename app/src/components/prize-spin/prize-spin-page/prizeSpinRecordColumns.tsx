import { Chip, IconButton, type IconButtonProps, Stack, Tooltip } from '@mui/material'
import ArchiveIcon from '@mui/icons-material/Archive'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { styled } from '@mui/material/styles'
import { Link, type LinkProps } from 'react-router-dom'
import { isPrizeSpinArchived, type PrizeSpinRecord } from '@/api/prize-spin'
import type { AppTableColumn } from '@/components/AppTable'
import { prizeSpinSessionRoute } from '@/lib/routes'
import { colors, toneChipSx } from '@/theme/colors'

const titleColumnSx = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
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

const MutedStatusChip = styled(Chip)(({ theme }) => ({
  height: 24,
  fontSize: '0.75rem',
  fontWeight: 500,
  bgcolor: theme.palette.action.hover,
  color: theme.palette.text.secondary,
  border: '1px solid',
  borderColor: theme.palette.divider,
}))

const RecordTitle = styled('span', {
  shouldForwardProp: (prop) => prop !== 'archived',
})<{ archived?: boolean }>(({ theme, archived }) => ({
  ...theme.typography.body2,
  fontWeight: 500,
  color: archived ? theme.palette.text.secondary : theme.palette.text.primary,
}))

const ActionsStack = styled(Stack)({
  justifyContent: 'flex-end',
})

const StyledActionIconButton = styled(IconButton)(({ theme }) => {
  const palette = theme.palette.primary

  return {
    borderRadius: theme.shape.borderRadius,
    width: 28,
    height: 28,
    border: '1px solid',
    borderColor: `${palette.main}66`,
    color: palette.main,
    '&:hover': {
      bgcolor: `${palette.main}1A`,
      borderColor: palette.main,
    },
  }
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

function recordStatusChip(record: PrizeSpinRecord) {
  if (isPrizeSpinArchived(record)) {
    return <MutedStatusChip label="Archived" size="small" />
  }

  return (
    <Chip label="Active" size="small" sx={toneChipSx(colors.success[400])} />
  )
}

type BuildPrizeSpinRecordColumnsOptions = {
  onArchive: (record: PrizeSpinRecord) => void
  onCopy: (record: PrizeSpinRecord) => void
}

export function buildPrizeSpinRecordColumns({
  onArchive,
  onCopy,
}: BuildPrizeSpinRecordColumnsOptions): AppTableColumn<PrizeSpinRecord>[] {
  return [
    {
      id: 'title',
      header: 'Title',
      width: '100%',
      sx: titleColumnSx,
      render: (record) => (
        <RecordTitle archived={isPrizeSpinArchived(record)}>
          {record.title}
        </RecordTitle>
      ),
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
      width: 120,
      minWidth: 120,
      sx: actionColumnSx,
      render: (record) => {
        const readOnly = isPrizeSpinArchived(record)

        return (
          <ActionsStack direction="row" spacing={0.5}>
            <Tooltip title="Archive">
              <span>
                <StyledActionIconButton
                  type="button"
                  aria-label={`Archive ${record.title}`}
                  size="small"
                  disabled={readOnly}
                  onClick={() => onArchive(record)}
                >
                  <ArchiveIcon sx={actionIconSx} aria-hidden />
                </StyledActionIconButton>
              </span>
            </Tooltip>
            <Tooltip title="Copy session">
              <StyledActionIconButton
                type="button"
                aria-label={`Copy session ${record.title}`}
                size="small"
                onClick={() => onCopy(record)}
              >
                <ContentCopyIcon sx={actionIconSx} aria-hidden />
              </StyledActionIconButton>
            </Tooltip>
            <Tooltip title="Open">
              <StyledOpenIconButton
                component={Link}
                to={prizeSpinSessionRoute(record.id)}
                aria-label={`Open ${record.title}`}
                size="small"
              >
                <ArrowForwardIcon sx={actionIconSx} aria-hidden />
              </StyledOpenIconButton>
            </Tooltip>
          </ActionsStack>
        )
      },
    },
  ]
}
