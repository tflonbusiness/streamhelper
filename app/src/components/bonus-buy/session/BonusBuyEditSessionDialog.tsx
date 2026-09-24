import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { styled } from '@mui/material/styles'
import { useState } from 'react'
import type { BonusBuyRecord } from '@/api/bonus-buy'
import { BonusBuyEditSessionForm } from '@/components/bonus-buy/session/BonusBuyEditSessionForm'
import { useNotification } from '@/context/NotificationContext'
import type { EditBonusBuySessionFormValues } from '@/lib/bonus-buy-validation'
import { usePatchBonusBuy } from '@/queries/use-bonus-buy'

const FORM_ID = 'bonus-buy-edit-session-form'

type BonusBuyEditSessionDialogProps = {
  accountId: number
  bonusBuyId: number
  record: BonusBuyRecord | null
  open: boolean
  onClose: () => void
}

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(2),
}))

export const BonusBuyEditSessionDialog = (
  props: BonusBuyEditSessionDialogProps,
) => {
  const { showSuccess, showError } = useNotification()
  const patchSessionMutation = usePatchBonusBuy(props.accountId, props.bonusBuyId)
  const [isFormValid, setIsFormValid] = useState(false)

  const handleClose = () => {
    if (patchSessionMutation.isPending) {
      return
    }

    props.onClose()

    if (!patchSessionMutation.isPending) {
      patchSessionMutation.reset()
    }
  }

  const handleSaveSession = (values: EditBonusBuySessionFormValues) => {
    if (!props.record) {
      return
    }

    patchSessionMutation.mutate(
      {
        name: values.name,
        currency_code: values.currencyCode,
        start_balance: values.startBalance.trim(),
      },
      {
        onSuccess: () => {
          showSuccess('Session updated.')
          handleClose()
          patchSessionMutation.reset()
        },
        onError: (error) => {
          showError(
            error instanceof Error ? error.message : 'Could not update session',
          )
        },
      },
    )
  }

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit</DialogTitle>
      <DialogContent>
        <BonusBuyEditSessionForm
          formId={FORM_ID}
          record={props.record}
          open={props.open}
          onSubmit={handleSaveSession}
          onValidChange={setIsFormValid}
        />
      </DialogContent>
      <StyledDialogActions>
        <Button
          type="button"
          variant="outlined"
          onClick={handleClose}
          disabled={patchSessionMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form={FORM_ID}
          variant="contained"
          startIcon={<SaveIcon fontSize="small" aria-hidden />}
          loading={patchSessionMutation.isPending}
          loadingPosition="start"
          disabled={!isFormValid || !props.record}
        >
          Save
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
