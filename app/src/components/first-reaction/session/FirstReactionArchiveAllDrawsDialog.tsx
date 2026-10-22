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
import { useArchiveAllFirstReactionDraws } from '@/queries/use-first-reaction-session'

type FirstReactionArchiveAllDrawsDialogProps = {
  accountId: number
  firstReactionId: number
  drawCount: number
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

export function FirstReactionArchiveAllDrawsDialog(
  props: FirstReactionArchiveAllDrawsDialogProps,
) {
  const { t } = useTranslation()
  const { showSuccess, showError } = useNotification()
  const archiveAllMutation = useArchiveAllFirstReactionDraws(
    props.accountId,
    props.firstReactionId,
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
        showSuccess(t('firstReaction.allDrawsArchived'))
        handleClose()
        archiveAllMutation.reset()
      },
      onError: (error) => {
        showError(
          error instanceof Error
            ? error.message
            : t('firstReaction.couldNotArchiveDraws'),
        )
      },
    })
  }

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('firstReaction.archiveAllDrawsTitle')}</DialogTitle>
      <DialogContent>
        <StyledDescription variant="body2">
          {t('firstReaction.archiveAllDrawsDescription', {
            count: props.drawCount,
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
          {t('firstReaction.archiveAllDrawsButton')}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
