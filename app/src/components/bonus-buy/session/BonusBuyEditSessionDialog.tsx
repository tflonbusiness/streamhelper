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
import type { BonusBuyRecord } from '@/api/bonus-buy'
import { StatusAlert } from '@/components/StatusAlert'
import { useNotification } from '@/context/NotificationContext'
import { usePatchBonusBuy } from '@/queries/use-bonus-buy'
import { inputFieldSx } from '@/theme/colors'

type BonusBuyEditSessionDialogProps = {
  accountId: number
  bonusBuyId: number
  record: BonusBuyRecord | null
  open: boolean
  onClose: () => void
}

export const BonusBuyEditSessionDialog = (
  props: BonusBuyEditSessionDialogProps,
) => {
  const { showSuccess } = useNotification()
  const patchSessionMutation = usePatchBonusBuy(props.accountId, props.bonusBuyId)

  const [sessionNameDraft, setSessionNameDraft] = useState('')
  const [sessionBalanceDraft, setSessionBalanceDraft] = useState('')
  const [sessionEditError, setSessionEditError] = useState<string | null>(null)

  useEffect(() => {
    if (props.open && props.record) {
      setSessionNameDraft(props.record.name)
      setSessionBalanceDraft(props.record.startBalance)
      setSessionEditError(null)
    }
  }, [props.open, props.record])

  async function handleSaveSession() {
    if (!props.record) {
      return
    }

    const trimmedName = sessionNameDraft.trim()
    if (!trimmedName) {
      setSessionEditError('Name is required')
      return
    }

    const parsedBalance = Number.parseFloat(sessionBalanceDraft)
    if (!Number.isFinite(parsedBalance) || parsedBalance <= 0) {
      setSessionEditError('Start balance must be greater than zero')
      return
    }

    setSessionEditError(null)
    try {
      await patchSessionMutation.mutateAsync({
        name: trimmedName,
        start_balance: parsedBalance.toFixed(2),
      })
      props.onClose()
      showSuccess('Session updated.')
    } catch (saveError) {
      setSessionEditError(
        saveError instanceof Error ? saveError.message : 'Could not update session',
      )
    }
  }

  return (
    <Dialog open={props.open} onClose={props.onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            value={sessionNameDraft}
            onChange={(event) => setSessionNameDraft(event.target.value)}
            fullWidth
            autoFocus
            sx={inputFieldSx}
          />
          <TextField
            label="Start balance ($)"
            type="number"
            value={sessionBalanceDraft}
            onChange={(event) => setSessionBalanceDraft(event.target.value)}
            slotProps={{
              htmlInput: { step: '0.01', min: 0, inputMode: 'decimal' },
            }}
            fullWidth
            sx={inputFieldSx}
          />
        </Stack>
        {sessionEditError ? (
          <Box sx={{ mt: 2 }}>
            <StatusAlert tone="error">{sessionEditError}</StatusAlert>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={props.onClose}
          disabled={patchSessionMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSaveSession()}
          disabled={patchSessionMutation.isPending}
        >
          {patchSessionMutation.isPending ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
