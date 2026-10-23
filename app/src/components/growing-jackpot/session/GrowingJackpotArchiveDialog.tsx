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
import type { GrowingJackpotRecord } from '@/api/growing-jackpot'
import { useNotification } from '@/context/NotificationContext'
import { useArchiveGrowingJackpot } from '@/queries/use-growing-jackpots'

type GrowingJackpotArchiveDialogProps = {
  accountId: number
  open: boolean
  record?: GrowingJackpotRecord | null
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

export function GrowingJackpotArchiveDialog({
  accountId,
  open,
  record,
  onClose,
}: GrowingJackpotArchiveDialogProps) {
  const { t } = useTranslation()
  const { showSuccess, showError } = useNotification()
  const archiveMutation = useArchiveGrowingJackpot(accountId)

  const handleArchive = () => {
    if (!record) {
      showError(t('growingJackpot.noSessionToArchive'))
      return
    }
    archiveMutation.mutate(record.id, {
      onSuccess: () => {
        showSuccess(t('growingJackpot.sessionArchived'))
        onClose()
      },
      onError: (error) =>
        showError(
          error instanceof Error
            ? error.message
            : t('growingJackpot.couldNotArchiveSession'),
        ),
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('growingJackpot.archiveSessionTitle')}</DialogTitle>
      <DialogContent>
        <StyledDescription>
          {t('growingJackpot.archiveListIntro', { title: record?.title ?? '' })}
        </StyledDescription>
      </DialogContent>
      <StyledDialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button
          color="error"
          variant="contained"
          disabled={!record || archiveMutation.isPending}
          onClick={handleArchive}
        >
          {t('table.archive')}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
