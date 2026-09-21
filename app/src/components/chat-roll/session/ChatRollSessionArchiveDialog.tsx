import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import ArchiveIcon from '@mui/icons-material/Archive'
import { styled } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import type { ChatRollRecord } from '@/api/chat-roll'
import { useNotification } from '@/context/NotificationContext'
import { useArchiveChatRollSession } from '@/queries/use-chat-roll-session'

type ChatRollSessionArchiveDialogProps = {
  accountId: number
  chatRollId: number
  record: ChatRollRecord | null
  open: boolean
  onClose: () => void
}

const StyledDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}))

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(2),
}))

export const ChatRollSessionArchiveDialog = (
  props: ChatRollSessionArchiveDialogProps,
) => {
  const navigate = useNavigate()
  const { showSuccess, showError } = useNotification()
  const archiveMutation = useArchiveChatRollSession(
    props.accountId,
    props.chatRollId,
  )

  const handleClose = () => {
    if (archiveMutation.isPending) {
      return
    }

    props.onClose()

    if (!archiveMutation.isPending) {
      archiveMutation.reset()
    }
  }

  const handleArchive = () => {
    if (!props.record) {
      return
    }

    archiveMutation.mutate(undefined, {
      onSuccess: () => {
        showSuccess('Session archived.')
        handleClose()
        archiveMutation.reset()
        navigate('/chat-roll')
      },
      onError: (error) => {
        showError(
          error instanceof Error ? error.message : 'Could not archive session',
        )
      },
    })
  }

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Archive session?</DialogTitle>
      <DialogContent>
        <StyledDescription variant="body2">
          {props.record?.title} will be removed from the active list. Archived
          sessions can be opened for review but not edited.
        </StyledDescription>
      </DialogContent>
      <StyledDialogActions>
        <Button type="button" variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="contained"
          color="warning"
          startIcon={<ArchiveIcon fontSize="small" aria-hidden />}
          onClick={() => void handleArchive()}
          loading={archiveMutation.isPending}
          loadingPosition="start"
          disabled={!props.record}
        >
          Archive
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
