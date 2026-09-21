import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { StatusAlert } from '@/components/StatusAlert'
import { useNotification } from '@/context/NotificationContext'
import { useEndBonusBuy } from '@/queries/use-bonus-buy'

type BonusBuyEndSessionDialogProps = {
  accountId: number
  bonusBuyId: number
  open: boolean
  onClose: () => void
}

export const BonusBuyEndSessionDialog = (
  props: BonusBuyEndSessionDialogProps,
) => {
  const { showSuccess } = useNotification()
  const endSessionMutation = useEndBonusBuy(props.accountId, props.bonusBuyId)
  const [endError, setEndError] = useState<string | null>(null)

  async function handleEndSession() {
    setEndError(null)

    try {
      await endSessionMutation.mutateAsync()
      props.onClose()
      showSuccess('Bonus buy session ended.')
    } catch (endSessionError) {
      setEndError(
        endSessionError instanceof Error
          ? endSessionError.message
          : 'Could not end bonus buy session',
      )
    }
  }

  return (
    <Dialog open={props.open} onClose={props.onClose} maxWidth="sm" fullWidth>
      <DialogTitle>End bonus buy session?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This marks the session as ended. You can still view stats and the bonus
          list, but adding new slots will be disabled.
        </Typography>
        {endError ? <StatusAlert tone="error">{endError}</StatusAlert> : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={props.onClose}
          disabled={endSessionMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="contained"
          color="error"
          onClick={() => void handleEndSession()}
          disabled={endSessionMutation.isPending}
        >
          {endSessionMutation.isPending ? 'Ending…' : 'End session'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
