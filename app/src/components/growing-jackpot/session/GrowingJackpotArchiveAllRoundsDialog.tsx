import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { useNotification } from '@/context/NotificationContext'
import { useArchiveAllGrowingJackpotRounds } from '@/queries/use-growing-jackpot-session'

type GrowingJackpotArchiveAllRoundsDialogProps = {
  accountId: number
  growingJackpotId: number
  roundCount: number
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

export function GrowingJackpotArchiveAllRoundsDialog(
  props: GrowingJackpotArchiveAllRoundsDialogProps,
) {
  const { t } = useTranslation()
  const { showSuccess, showError } = useNotification()
  const archiveAllMutation = useArchiveAllGrowingJackpotRounds(
    props.accountId,
    props.growingJackpotId,
  )

  const handleClose = () => {
    props.onClose()
    if (!archiveAllMutation.isPending) {
      archiveAllMutation.reset()
    }
  }

  const handleArchiveAll = () => {
    archiveAllMutation.mutate(undefined, {
      onSuccess: () => {
        showSuccess(t('growingJackpot.allRoundsArchived'))
        handleClose()
        archiveAllMutation.reset()
      },
      onError: (error) => {
        showError(
          error instanceof Error
            ? error.message
            : t('growingJackpot.couldNotArchiveRounds'),
        )
      },
    })
  }

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('growingJackpot.archiveAllRoundsTitle')}</DialogTitle>
      <DialogContent>
        <StyledDescription variant="body2">
          {t('growingJackpot.archiveAllRoundsDescription', {
            count: props.roundCount,
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
          loading={archiveAllMutation.isPending}
          loadingPosition="start"
        >
          {t('growingJackpot.archiveAllRoundsButton')}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
