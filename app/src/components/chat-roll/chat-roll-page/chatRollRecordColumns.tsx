import { Chip, IconButton, type IconButtonProps, Stack, Tooltip } from '@mui/material'
import ArchiveIcon from '@mui/icons-material/Archive'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { alpha, styled } from '@mui/material/styles'
import { Link, type LinkProps } from 'react-router-dom'
import { isChatRollArchived, type ChatRollRecord } from '@/api/chat-roll'
import type { AppTableColumn } from '@/components/AppTable'
import { chatRollSessionRoute } from '@/lib/routes'
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

const StyledActionIconButton = styled(IconButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  width: 28,
  height: 28,
  border: '1px solid',
  borderColor: alpha(theme.palette.primary.main, 0.4),
  color: theme.palette.primary.main,
  '&:hover': {
    bgcolor: alpha(theme.palette.primary.main, 0.1),
    borderColor: theme.palette.primary.main,
  },
}))

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

function recordStatusChip(record: ChatRollRecord) {
  if (isChatRollArchived(record)) {
    return <MutedStatusChip label="Archived" size="small" />
  }

  return <MutedStatusChip label="Active" size="small" />
}

type BuildChatRollRecordColumnsOptions = {
  onArchive: (record: ChatRollRecord) => void
}

export function buildChatRollRecordColumns({
  onArchive,
}: BuildChatRollRecordColumnsOptions): AppTableColumn<ChatRollRecord>[] {
  return [
    {
      id: 'title',
      header: 'Title',
      width: '100%',
      sx: titleColumnSx,
      render: (record) => (
        <RecordTitle archived={isChatRollArchived(record)}>
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
      width: 88,
      minWidth: 88,
      sx: actionColumnSx,
      render: (record) => {
        const readOnly = isChatRollArchived(record)

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
            <StyledOpenIconButton
              component={Link}
              to={chatRollSessionRoute(record.id)}
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
