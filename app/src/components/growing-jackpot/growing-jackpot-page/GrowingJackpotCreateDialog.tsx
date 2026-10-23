import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNotification } from '@/context/NotificationContext'
import { useCreateGrowingJackpot } from '@/queries/use-growing-jackpots'

type GrowingJackpotCreateDialogProps = {
  accountId: number
  open: boolean
  onClose: () => void
}

const StyledDescription = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  color: theme.palette.text.secondary,
}))

const StyledFormStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2.5),
}))

const StyledTitleField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
}))

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(2),
}))

export function GrowingJackpotCreateDialog({
  accountId,
  open,
  onClose,
}: GrowingJackpotCreateDialogProps) {
  const { t } = useTranslation()
  const { showSuccess, showError } = useNotification()
  const defaultTitle = t('growingJackpot.defaultSessionTitle')
  const [title, setTitle] = useState(defaultTitle)
  const createMutation = useCreateGrowingJackpot(accountId)

  useEffect(() => {
    if (open) {
      setTitle(t('growingJackpot.defaultSessionTitle'))
    }
  }, [open, t])

  const handleClose = () => {
    if (!createMutation.isPending) {
      onClose()
    }
  }

  const handleCreate = () => {
    createMutation.mutate(title.trim(), {
      onSuccess: () => {
        showSuccess(t('growingJackpot.sessionCreated'))
        setTitle(t('growingJackpot.defaultSessionTitle'))
        onClose()
      },
      onError: (error) =>
        showError(
          error instanceof Error
            ? error.message
            : t('growingJackpot.couldNotCreateSession'),
        ),
    })
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('growingJackpot.createDialogTitle')}</DialogTitle>
      <DialogContent>
        <StyledDescription>
          {t('growingJackpot.createDialogDescription')}
        </StyledDescription>
        <StyledFormStack>
          <StyledTitleField
            autoFocus
            fullWidth
            label={t('growingJackpot.sessionTitleLabel')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </StyledFormStack>
      </DialogContent>
      <StyledDialogActions>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button
          variant="contained"
          disabled={title.trim().length === 0 || createMutation.isPending}
          onClick={handleCreate}
        >
          {t('common.create')}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
