import { useTranslation } from 'react-i18next'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import ArchiveIcon from '@mui/icons-material/Archive'
import { styled } from '@mui/material/styles'
import type { PrizeSpinRecord } from '@/api/prize-spin'
import { useNotification } from '@/context/NotificationContext'
import { useArchivePrizeSpinSession } from '@/queries/use-prize-spin-session'

type PrizeSpinSessionArchiveDialogProps = {
  accountId: number
  prizeSpinId: number
  record: PrizeSpinRecord | null
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

export const PrizeSpinSessionArchiveDialog = (
  props: PrizeSpinSessionArchiveDialogProps,
) => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useNotification()
  const archiveMutation = useArchivePrizeSpinSession(
    props.accountId,
    props.prizeSpinId,
  )

  const handleClose = () => {
    if (archiveMutation.isPending) {
      return
    }

    props.onClose()

    if (!archiveMutation.isPending) {
      archiveMutation.reset()
    }
  }

  const handleArchive = () => {
    if (!props.record) {
      return
    }

    archiveMutation.mutate(undefined, {
      onSuccess: () => {
        showSuccess(t('prizeSpin.sessionArchived'))
        handleClose()
        archiveMutation.reset()
      },
      onError: (error) => {
        showError(
          error instanceof Error ? error.message : t('prizeSpin.couldNotArchiveSession'),
        )
      },
    })
  }

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="xs" fullWidth>
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
          startIcon={<ArchiveIcon fontSize="small" aria-hidden />}
          onClick={() => void handleArchive()}
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
