import { useTranslation } from 'react-i18next'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { styled } from '@mui/material/styles'
import type { BonusBuySlot } from '@/api/bonus-buy'
import { useNotification } from '@/context/NotificationContext'
import { useArchiveBonusBuySlot } from '@/queries/use-bonus-buy'

type BonusBuyDeleteSlotDialogProps = {
  accountId: number
  bonusBuyId: number
  slot: BonusBuySlot | null
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

export const BonusBuyDeleteSlotDialog = (
  props: BonusBuyDeleteSlotDialogProps,
) => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useNotification()
  const archiveSlotMutation = useArchiveBonusBuySlot(
    props.accountId,
    props.bonusBuyId,
  )

  const handleClose = () => {
    if (archiveSlotMutation.isPending) {
      return
    }

    props.onClose()

    if (!archiveSlotMutation.isPending) {
      archiveSlotMutation.reset()
    }
  }

  const handleConfirmDelete = () => {
    if (!props.slot) {
      return
    }

    archiveSlotMutation.mutate(props.slot.id, {
      onSuccess: () => {
        showSuccess(t('bonusBuy.slotDeleted'))
        handleClose()
        archiveSlotMutation.reset()
      },
      onError: (error) => {
        showError(
          error instanceof Error ? error.message : t('bonusBuy.couldNotDeleteSlot'),
        )
      },
    })
  }

  return (
    <Dialog
      open={props.slot !== null}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{t('bonusBuy.deleteSlotTitle')}</DialogTitle>
      <DialogContent>
        <StyledDescription variant="body2">
          Delete the <b>"{props.slot?.name}"</b> slot from this session?
        </StyledDescription>
      </DialogContent>
      <StyledDialogActions>
        <Button
          type="button"
          variant="outlined"
          onClick={handleClose}
          disabled={archiveSlotMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="contained"
          color="warning"
          startIcon={<DeleteIcon fontSize="small" aria-hidden />}
          onClick={() => void handleConfirmDelete()}
          loading={archiveSlotMutation.isPending}
          loadingPosition="start"
          disabled={!props.slot}
        >
          Delete
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
