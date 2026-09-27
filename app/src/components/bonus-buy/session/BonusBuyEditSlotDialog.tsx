import { useTranslation } from 'react-i18next'
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
import type { BonusBuySlot } from '@/api/bonus-buy'
import { isBonusBuySlotPlaying } from '@/api/bonus-buy'
import { BonusBuyEditSlotForm } from '@/components/bonus-buy/session/BonusBuyEditSlotForm'
import { useNotification } from '@/context/NotificationContext'
import type { EditBonusBuySlotFormValues } from '@/lib/bonus-buy-validation'
import { usePatchBonusBuySlot } from '@/queries/use-bonus-buy'

const FORM_ID = 'bonus-buy-edit-slot-form'

type BonusBuyEditSlotDialogProps = {
  accountId: number
  bonusBuyId: number
  currencyCode: string
  slot: BonusBuySlot | null
  onClose: () => void
}

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(2),
}))

export const BonusBuyEditSlotDialog = (props: BonusBuyEditSlotDialogProps) => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useNotification()
  const patchSlotMutation = usePatchBonusBuySlot(props.accountId, props.bonusBuyId)
  const [isFormValid, setIsFormValid] = useState(false)

  const handleClose = () => {
    if (patchSlotMutation.isPending) {
      return
    }

    props.onClose()

    if (!patchSlotMutation.isPending) {
      patchSlotMutation.reset()
    }
  }

  const handleSaveEditSlot = (values: EditBonusBuySlotFormValues) => {
    if (!props.slot) {
      return
    }

    const trimmedWin = values.winAmount.trim()

    patchSlotMutation.mutate(
      {
        slotId: props.slot.id,
        body: {
          name: values.name,
          provider_name: values.providerName.trim() || null,
          purchase_amount: Number.parseFloat(values.purchaseAmount).toFixed(2),
          win_amount: trimmedWin
            ? Number.parseFloat(trimmedWin).toFixed(2)
            : null,
          status: isBonusBuySlotPlaying(props.slot) ? 'playing' : 'pending',
        },
      },
      {
        onSuccess: () => {
          showSuccess(t('bonusBuy.slotUpdated'))
          handleClose()
          patchSlotMutation.reset()
        },
        onError: (error) => {
          showError(
            error instanceof Error ? error.message : t('bonusBuy.couldNotUpdateSlot'),
          )
        },
      },
    )
  }

  return (
    <Dialog
      open={props.slot !== null}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t('bonusBuy.editSlotTitle')}</DialogTitle>
      <DialogContent>
        <BonusBuyEditSlotForm
          formId={FORM_ID}
          slot={props.slot}
          currencyCode={props.currencyCode}
          onSubmit={handleSaveEditSlot}
          onValidChange={setIsFormValid}
        />
      </DialogContent>
      <StyledDialogActions>
        <Button
          type="button"
          variant="outlined"
          onClick={handleClose}
          disabled={patchSlotMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form={FORM_ID}
          variant="contained"
          startIcon={<SaveIcon fontSize="small" aria-hidden />}
          loading={patchSlotMutation.isPending}
          loadingPosition="start"
          disabled={!isFormValid || !props.slot}
        >
          Save
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
