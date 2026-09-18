import { Chip, IconButton, type IconButtonProps, Stack, Tooltip } from '@mui/material'
import { SquareRounded as SquareRoundedIcon } from '@mui/icons-material'
import ArchiveIcon from '@mui/icons-material/Archive'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import PodcastsIcon from '@mui/icons-material/Podcasts'
import { alpha, styled } from '@mui/material/styles'
import { Link, type LinkProps } from 'react-router-dom'
import {
  isPrizeSpinArchived,
  isPrizeSpinLive,
  type PrizeSpinRecord,
} from '@/api/prize-spin'
import type { AppTableColumn } from '@/components/AppTable'
import { LiveStatusChip } from '@/components/LiveStatusChip'
import { colors } from '@/theme/colors'
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
  bgcolor: alpha(theme.palette.text.primary, 0.06),
  color: theme.palette.text.secondary,
  border: '1px solid',
  borderColor: alpha(theme.palette.text.primary, 0.1),
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

type ActionButtonVariant = 'error' | 'success' | 'warning'

const StyledActionIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'actionVariant',
})<{ actionVariant: ActionButtonVariant }>(({ theme, actionVariant }) => {
  const palette =
    actionVariant === 'error'
      ? theme.palette.error
      : actionVariant === 'success'
        ? theme.palette.success
        : theme.palette.warning

  return {
    borderRadius: theme.shape.borderRadius,
    width: 28,
    height: 28,
    border: '1px solid',
    borderColor: alpha(palette.main, 0.4),
    color: actionVariant === 'success' ? palette.light : palette.main,
    '&:hover': {
      bgcolor: alpha(palette.main, 0.1),
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

  if (isPrizeSpinLive(record)) {
    return <LiveStatusChip />
  }

  return <MutedStatusChip label="Off Air" size="small" />
}

type BuildPrizeSpinRecordColumnsOptions = {
  liveActionRecordId: number | null
  onGoLive: (record: PrizeSpinRecord) => void
  onDeactivate: (record: PrizeSpinRecord) => void
  onArchive: (record: PrizeSpinRecord) => void
}

export function buildPrizeSpinRecordColumns({
  liveActionRecordId,
  onGoLive,
  onDeactivate,
  onArchive,
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
      width: 128,
      minWidth: 128,
      sx: actionColumnSx,
      render: (record) => {
        const isUpdating = liveActionRecordId === record.id
        const readOnly = isPrizeSpinArchived(record)

        return (
          <ActionsStack direction="row" spacing={0.5}>
            {!readOnly && isPrizeSpinLive(record) ? (
              <Tooltip title="Off Air">
                <span>
                  <StyledActionIconButton
                    type="button"
                    actionVariant="error"
                    aria-label={`Take ${record.title} off Air`}
                    size="small"
                    disabled={isUpdating}
                    onClick={() => void onDeactivate(record)}
                  >
                    <SquareRoundedIcon sx={actionIconSx} aria-hidden />
                  </StyledActionIconButton>
                </span>
              </Tooltip>
            ) : null}
            {!readOnly && !isPrizeSpinLive(record) ? (
              <Tooltip title="Go live">
                <span>
                  <StyledActionIconButton
                    type="button"
                    actionVariant="success"
                    aria-label={`Go live with ${record.title}`}
                    size="small"
                    disabled={isUpdating}
                    onClick={() => void onGoLive(record)}
                  >
                    <PodcastsIcon sx={actionIconSx} aria-hidden />
                  </StyledActionIconButton>
                </span>
              </Tooltip>
            ) : null}
            <Tooltip title="Archive">
              <span>
                <StyledActionIconButton
                  type="button"
                  actionVariant="warning"
                  aria-label={`Archive ${record.title}`}
                  size="small"
                  disabled={readOnly || isUpdating}
                  onClick={() => onArchive(record)}
                >
                  <ArchiveIcon sx={actionIconSx} aria-hidden />
                </StyledActionIconButton>
              </span>
            </Tooltip>
            <StyledOpenIconButton
              component={Link}
              to={`/prize-spin/${record.id}`}
              aria-label={`Open ${record.title}`}
              size="small"
            >
              <ArrowForwardIcon sx={actionIconSx} aria-hidden />
            </StyledOpenIconButton>
          </ActionsStack>
        )
      },
    },
  ]
}
