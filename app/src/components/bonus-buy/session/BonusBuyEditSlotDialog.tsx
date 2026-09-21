import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import { useEffect, useState } from 'react'
import type { BonusBuySlot } from '@/api/bonus-buy'
import { isBonusBuySlotPlaying } from '@/api/bonus-buy'
import { StatusAlert } from '@/components/StatusAlert'
import { useNotification } from '@/context/NotificationContext'
import { usePatchBonusBuySlot } from '@/queries/use-bonus-buy'
import { inputFieldSx } from '@/theme/colors'

type BonusBuyEditSlotDialogProps = {
  accountId: number
  bonusBuyId: number
  slot: BonusBuySlot | null
  onClose: () => void
}

export const BonusBuyEditSlotDialog = (props: BonusBuyEditSlotDialogProps) => {
  const { showSuccess } = useNotification()
  const patchSlotMutation = usePatchBonusBuySlot(props.accountId, props.bonusBuyId)

  const [editSlotName, setEditSlotName] = useState('')
  const [editNickProvider, setEditNickProvider] = useState('')
  const [editPurchaseAmount, setEditPurchaseAmount] = useState('')
  const [editWinAmount, setEditWinAmount] = useState('')
  const [editSlotError, setEditSlotError] = useState<string | null>(null)

  useEffect(() => {
    if (props.slot) {
      setEditSlotName(props.slot.name)
      setEditNickProvider(props.slot.providerName ?? '')
      setEditPurchaseAmount(props.slot.purchaseAmount)
      setEditWinAmount(props.slot.winAmount ?? '')
      setEditSlotError(null)
    }
  }, [props.slot])

  async function handleSaveEditSlot() {
    if (!props.slot) {
      return
    }

    const trimmedSlot = editSlotName.trim()
    const parsedPurchase = Number.parseFloat(editPurchaseAmount)
    const trimmedWin = editWinAmount.trim()

    if (!trimmedSlot) {
      setEditSlotError('Slot name is required')
      return
    }

    if (!Number.isFinite(parsedPurchase) || parsedPurchase <= 0) {
      setEditSlotError('Purchase amount must be greater than zero')
      return
    }

    if (trimmedWin) {
      const parsedWin = Number.parseFloat(trimmedWin)
      if (!Number.isFinite(parsedWin)) {
        setEditSlotError('Win amount must be a valid number')
        return
      }
      if (parsedWin < 0) {
        setEditSlotError('Win amount cannot be negative')
        return
      }
    }

    setEditSlotError(null)
    try {
      await patchSlotMutation.mutateAsync({
        slotId: props.slot.id,
        body: {
          name: trimmedSlot,
          provider_name: editNickProvider.trim() || null,
          purchase_amount: parsedPurchase.toFixed(2),
          win_amount: trimmedWin ? Number.parseFloat(trimmedWin).toFixed(2) : null,
          status: isBonusBuySlotPlaying(props.slot) ? 'playing' : 'pending',
        },
      })
      props.onClose()
      showSuccess('Slot updated.')
    } catch (saveError) {
      setEditSlotError(
        saveError instanceof Error ? saveError.message : 'Could not update slot',
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
      <DialogTitle>Edit slot</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Slot"
            value={editSlotName}
            onChange={(event) => setEditSlotName(event.target.value)}
            fullWidth
            sx={inputFieldSx}
          />
          <TextField
            label="Nickname"
            value={editNickProvider}
            onChange={(event) => setEditNickProvider(event.target.value)}
            fullWidth
            sx={inputFieldSx}
          />
          <TextField
            label="Purchase ($)"
            type="number"
            value={editPurchaseAmount}
            onChange={(event) => setEditPurchaseAmount(event.target.value)}
            slotProps={{
              htmlInput: { step: '0.01', min: 0, inputMode: 'decimal' },
            }}
            fullWidth
            sx={inputFieldSx}
          />
          <TextField
            label="Win ($)"
            type="number"
            value={editWinAmount}
            onChange={(event) => setEditWinAmount(event.target.value)}
            placeholder="Leave empty if pending"
            slotProps={{
              htmlInput: { step: '0.01', min: 0, inputMode: 'decimal' },
            }}
            fullWidth
            sx={inputFieldSx}
          />
        </Stack>
        {editSlotError ? (
          <Box sx={{ mt: 2 }}>
            <StatusAlert tone="error">{editSlotError}</StatusAlert>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={props.onClose} disabled={patchSlotMutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSaveEditSlot()}
          disabled={patchSlotMutation.isPending}
        >
          {patchSlotMutation.isPending ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
