import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import type { BonusBuySlot } from '@/api/bonus-buy'
import { StatusAlert } from '@/components/StatusAlert'
import { useNotification } from '@/context/NotificationContext'
import { useArchiveBonusBuySlot } from '@/queries/use-bonus-buy'

type BonusBuyDeleteSlotDialogProps = {
  accountId: number
  bonusBuyId: number
  slot: BonusBuySlot | null
  onClose: () => void
}

export const BonusBuyDeleteSlotDialog = (
  props: BonusBuyDeleteSlotDialogProps,
) => {
  const { showSuccess } = useNotification()
  const archiveSlotMutation = useArchiveBonusBuySlot(
    props.accountId,
    props.bonusBuyId,
  )
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleConfirmDelete() {
    if (!props.slot) {
      return
    }

    setDeleteError(null)
    try {
      await archiveSlotMutation.mutateAsync(props.slot.id)
      props.onClose()
      showSuccess('Slot deleted.')
    } catch (deleteSlotError) {
      setDeleteError(
        deleteSlotError instanceof Error
          ? deleteSlotError.message
          : 'Could not delete slot',
      )
    }
  }

  return (
    <Dialog
      open={props.slot !== null}
      onClose={props.onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Delete slot?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {props.slot
            ? `Remove "${props.slot.name}" from this session? The record will be archived.`
            : null}
        </Typography>
        {deleteError ? (
          <Box sx={{ mt: 2 }}>
            <StatusAlert tone="error">{deleteError}</StatusAlert>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={props.onClose}
          disabled={archiveSlotMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => void handleConfirmDelete()}
          disabled={archiveSlotMutation.isPending}
        >
          {archiveSlotMutation.isPending ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
