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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FIRST_REACTION_DEFAULT_TITLE } from '@/components/first-reaction/first-reaction-page/first-reaction-page-utils'
import { useNotification } from '@/context/NotificationContext'
import { useCreateFirstReaction } from '@/queries/use-first-reactions'

type FirstReactionCreateDialogProps = {
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

export function FirstReactionCreateDialog({
  accountId,
  open,
  onClose,
}: FirstReactionCreateDialogProps) {
  const { t } = useTranslation()
  const { showSuccess, showError } = useNotification()
  const [title, setTitle] = useState(FIRST_REACTION_DEFAULT_TITLE)
  const createMutation = useCreateFirstReaction(accountId)

  const handleClose = () => {
    if (!createMutation.isPending) {
      onClose()
    }
  }

  const handleCreate = () => {
    createMutation.mutate(title.trim(), {
      onSuccess: () => {
        showSuccess(t('firstReaction.sessionCreated'))
        setTitle(FIRST_REACTION_DEFAULT_TITLE)
        onClose()
      },
      onError: (error) =>
        showError(
          error instanceof Error
            ? error.message
            : t('firstReaction.couldNotCreateSession'),
        ),
    })
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('firstReaction.createDialogTitle')}</DialogTitle>
      <DialogContent>
        <StyledDescription>
          {t('firstReaction.createDialogDescription')}
        </StyledDescription>
        <StyledFormStack>
          <StyledTitleField
            autoFocus
            fullWidth
            label={t('firstReaction.sessionTitleLabel')}
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
