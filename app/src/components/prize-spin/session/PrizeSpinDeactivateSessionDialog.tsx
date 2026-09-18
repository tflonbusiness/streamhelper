import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import { SquareRounded as SquareRoundedIcon } from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import { useNotification } from '@/context/NotificationContext'
import { useDeactivatePrizeSpinSession } from '@/queries/use-prize-spin-session'

type PrizeSpinDeactivateSessionDialogProps = {
  accountId: number
  prizeSpinId: number
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

export const PrizeSpinDeactivateSessionDialog = (
  props: PrizeSpinDeactivateSessionDialogProps,
) => {
  const { showSuccess, showError } = useNotification()
  const deactivateMutation = useDeactivatePrizeSpinSession(
    props.accountId,
    props.prizeSpinId,
  )

  const handleClose = () => {
    props.onClose()

    if (!deactivateMutation.isPending) {
      deactivateMutation.reset()
    }
  }

  const handleDeactivate = () => {
    deactivateMutation.mutate(undefined, {
      onSuccess: () => {
        showSuccess('Session taken off air.')
        handleClose()
        deactivateMutation.reset()
      },
      onError: (error) => {
        showError(
          error instanceof Error
            ? error.message
            : 'Could not deactivate session',
        )
      },
    })
  }

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Take session off air?</DialogTitle>
      <DialogContent>
        <StyledDescription variant="body2">
          The stream overlay will show no live session until you go live again.
        </StyledDescription>
      </DialogContent>
      <StyledDialogActions>
        <Button type="button" variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="contained"
          color="error"
          startIcon={<SquareRoundedIcon sx={{ fontSize: 16 }} aria-hidden />}
          onClick={() => void handleDeactivate()}
          loading={deactivateMutation.isPending}
          loadingPosition="start"
        >
          Off air
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
