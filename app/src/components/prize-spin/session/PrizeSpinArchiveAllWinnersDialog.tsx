import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
        showSuccess(t('prizeSpin.allWinnersArchived'))
        handleClose()
        deleteAllMutation.reset()
      },
      onError: (error) => {
        showError(
          error instanceof Error
            ? error.message
            : t('prizeSpin.couldNotArchiveWinners'),
        )
      },
    })
  }

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('prizeSpin.archiveAllWinnersTitle')}</DialogTitle>
      <DialogContent>
        <StyledDescription variant="body2">
          {t('prizeSpin.archiveAllWinnersDescription', {
            count: props.winnerCount,
          })}
        </StyledDescription>
      </DialogContent>
      <StyledDialogActions>
        <Button type="button" variant="outlined" onClick={handleClose}>
          {t('common.cancel')}
        </Button>
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={() => void handleArchiveAll()}
          loading={deleteAllMutation.isPending}
          loadingPosition="start"
        >
          {t('prizeSpin.archiveAllWinnersButton')}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
