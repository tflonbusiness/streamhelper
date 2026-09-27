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
import type { PrizeSpinRecord } from '@/api/prize-spin'
import { useNotification } from '@/context/NotificationContext'
import { useArchivePrizeSpin } from '@/queries/use-prize-spins'

type PrizeSpinArchiveDialogProps = {
  accountId: number
  open: boolean
  record?: PrizeSpinRecord | null
  onClose: () => void
  onArchived?: () => void
}

const StyledDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}))

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(2),
}))

export const PrizeSpinArchiveDialog = (props: PrizeSpinArchiveDialogProps) => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useNotification()
  const archiveMutation = useArchivePrizeSpin(props.accountId)

  const handleClose = () => {
    props.onClose()

    if (!archiveMutation.isPending) {
      archiveMutation.reset()
    }
  }

  const handleArchive = () => {
    if (!props.record) {
      showError(t('prizeSpin.noSessionToArchive'))
      return
    }

    archiveMutation.mutate(props.record.id, {
      onSuccess: () => {
        showSuccess(t('bonusBuy.sessionArchived'))
        props.onArchived?.()
        handleClose()
        archiveMutation.reset()
      },
      onError: () => showError(t('prizeSpin.couldNotArchiveSession')),
    })
  }

  return (
    <Dialog
      open={props.open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{t('prizeSpin.archiveSessionTitle')}</DialogTitle>
      <DialogContent>
        <StyledDescription variant="body2">
          {t('prizeSpin.archiveListIntro', { title: props.record?.title ?? '' })}
          {' '}
          {t('prizeSpin.archiveListOutro')}
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
          onClick={handleArchive}
          loading={archiveMutation.isPending}
          loadingPosition="start"
          disabled={!props.record}
        >
          {t('common.archive')}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
