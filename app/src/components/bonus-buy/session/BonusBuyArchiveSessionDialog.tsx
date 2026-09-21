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
import type { BonusBuyRecord } from '@/api/bonus-buy'
import { useNotification } from '@/context/NotificationContext'
import { useArchiveBonusBuySession } from '@/queries/use-bonus-buy'

type BonusBuyArchiveSessionDialogProps = {
  accountId: number
  bonusBuyId: number
  record: BonusBuyRecord | null
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

export const BonusBuyArchiveSessionDialog = (
  props: BonusBuyArchiveSessionDialogProps,
) => {
  const { showSuccess, showError } = useNotification()
  const archiveMutation = useArchiveBonusBuySession(
    props.accountId,
    props.bonusBuyId,
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
          <b>"{props.record?.name}"</b> will be removed from the active list. Archived
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
