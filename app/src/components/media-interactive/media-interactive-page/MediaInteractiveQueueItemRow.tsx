import {
  Box,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import CloseIcon from '@mui/icons-material/Close'
import { styled } from '@mui/material/styles'
import { formatDuration, type MediaInteractiveItem } from '@/api/media-interactive'

type MediaInteractiveQueueItemRowProps = {
  item: MediaInteractiveItem
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  disableUp: boolean
  disableDown: boolean
}

const StyledRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
  '&:last-child': {
    borderBottom: 'none',
    paddingBottom: 0,
  },
}))

const StyledMeta = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}))

export function MediaInteractiveQueueItemRow({
  item,
  onRemove,
  onMoveUp,
  onMoveDown,
  disableUp,
  disableDown,
}: MediaInteractiveQueueItemRowProps) {
  const statusSuffix =
    item.status !== 'queued' && item.status !== 'playing'
      ? ` · ${item.status}`
      : ''

  return (
    <StyledRow>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {item.title}
        </Typography>
        <StyledMeta variant="caption" component="span">
          {formatDuration(item.durationSeconds)} · {item.requesterNick}
          {item.pointsCharged > 0 ? ` · ${item.pointsCharged} pts` : ''}
          {statusSuffix}
        </StyledMeta>
      </Box>
      <IconButton
        size="small"
        disabled={disableUp}
        onClick={onMoveUp}
        aria-label="Move up"
      >
        <ArrowUpwardIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        disabled={disableDown}
        onClick={onMoveDown}
        aria-label="Move down"
      >
        <ArrowDownwardIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        color="error"
        onClick={onRemove}
        aria-label="Remove"
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </StyledRow>
  )
}
