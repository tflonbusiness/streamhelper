import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useNotification } from '@/context/NotificationContext'
import { useDeleteAllPrizeSpinWins } from '@/queries/use-prize-spin-session'

type PrizeSpinArchiveAllWinnersDialogProps = {
  accountId: number
  prizeSpinId: number
  winnerCount: number
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

export const PrizeSpinArchiveAllWinnersDialog = (
  props: PrizeSpinArchiveAllWinnersDialogProps,
) => {
  const { showSuccess, showError } = useNotification()
  const deleteAllMutation = useDeleteAllPrizeSpinWins(
    props.accountId,
    props.prizeSpinId,
  )

  const handleClose = () => {
    props.onClose()

    if (!deleteAllMutation.isPending) {
      deleteAllMutation.reset()
    }
  }

  const handleArchiveAll = () => {
    deleteAllMutation.mutate(undefined, {
      onSuccess: () => {
        showSuccess('All winners archived.')
        handleClose()
        deleteAllMutation.reset()
      },
      onError: (error) => {
        showError(
          error instanceof Error
            ? error.message
            : 'Could not archive winners',
        )
      },
    })
  }

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Archive all winners?</DialogTitle>
      <DialogContent>
        <StyledDescription variant="body2">
          This removes all {props.winnerCount} winner
          {props.winnerCount === 1 ? '' : 's'} from the list. Archived records
          stay in the database.
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
          onClick={() => void handleArchiveAll()}
          loading={deleteAllMutation.isPending}
          loadingPosition="start"
        >
          Archive all
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
