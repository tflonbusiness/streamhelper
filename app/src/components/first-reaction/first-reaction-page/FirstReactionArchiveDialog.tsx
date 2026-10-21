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
import type { FirstReactionRecord } from '@/api/first-reaction'
import { useNotification } from '@/context/NotificationContext'
import { useArchiveFirstReaction } from '@/queries/use-first-reaction-session'

type FirstReactionArchiveDialogProps = {
  accountId: number
  open: boolean
  record?: FirstReactionRecord | null
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

export function FirstReactionArchiveDialog({
  accountId,
  open,
  record,
  onClose,
}: FirstReactionArchiveDialogProps) {
  const { t } = useTranslation()
  const { showSuccess, showError } = useNotification()
  const archiveMutation = useArchiveFirstReaction(accountId)

  const handleArchive = () => {
    if (!record) {
      showError(t('firstReaction.noSessionToArchive'))
      return
    }
    archiveMutation.mutate(record.id, {
      onSuccess: () => {
        showSuccess(t('firstReaction.sessionArchived'))
        onClose()
      },
      onError: (error) =>
        showError(
          error instanceof Error
            ? error.message
            : t('firstReaction.couldNotArchiveSession'),
        ),
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('firstReaction.archiveSessionTitle')}</DialogTitle>
      <DialogContent>
        <StyledDescription>
          {t('firstReaction.archiveListIntro', { title: record?.title ?? '' })}
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
