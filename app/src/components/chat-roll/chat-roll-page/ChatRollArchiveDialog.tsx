import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import type { ChatRollRecord } from '@/api/chat-roll'
import { useNotification } from '@/context/NotificationContext'
import { useArchiveChatRoll } from '@/queries/use-chat-rolls'

type ChatRollArchiveDialogProps = {
  accountId: number
  open: boolean
  record?: ChatRollRecord | null
  onClose: () => void
  onArchived?: () => void
}

const StyledDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}))

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(2),
}))

export const ChatRollArchiveDialog = (props: ChatRollArchiveDialogProps) => {
  const { showSuccess, showError } = useNotification()
  const archiveMutation = useArchiveChatRoll(props.accountId)

  const handleClose = () => {
    props.onClose()

    if (!archiveMutation.isPending) {
      archiveMutation.reset()
    }
  }

  const handleArchive = () => {
    if (!props.record) {
      showError('No session to archive.')
      return
    }

    archiveMutation.mutate(props.record.id, {
      onSuccess: () => {
        showSuccess('Session archived.')
        props.onArchived?.()
        handleClose()
        archiveMutation.reset()
      },
      onError: () => showError('Could not archive session.'),
    })
  }

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Archive Session?</DialogTitle>
      <DialogContent>
        <StyledDescription variant="body2">
          <b>{props.record?.title}</b> will be removed from the active list.
          Archived sessions can be opened for review but not edited.
        </StyledDescription>
      </DialogContent>
      <StyledDialogActions>
        <Button type="button" variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={handleArchive}
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
