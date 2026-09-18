import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import type { PrizeSpinRecord } from '@/api/prize-spin'
import { useNotification } from '@/context/NotificationContext'
import { useArchivePrizeSpin } from '@/queries/use-prize-spins'

type PrizeSpinArchiveDialogProps = {
  accountId: number
  open: boolean
  record: PrizeSpinRecord | null
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

export const PrizeSpinArchiveDialog = (props: PrizeSpinArchiveDialogProps) => {
  const { showSuccess, showError } = useNotification()
  const archiveMutation = useArchivePrizeSpin(props.accountId)

  const handleClose = () => {
    props.onClose()

    if (!archiveMutation.isPending) {
      archiveMutation.reset()
    }
  }

  const handleArchive = () => {
    if (!props.record) {
      return
    }

    archiveMutation.mutate(props.record.id, {
      onSuccess: () => {
        showSuccess('Session archived.')
        props.onArchived?.()
        handleClose()
        archiveMutation.reset()
      },
      onError: (error) => {
        showError(
          error instanceof Error ? error.message : 'Could not archive session',
        )
      },
    })
  }

  return (
    <Dialog
      open={props.open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Archive Session?</DialogTitle>
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
