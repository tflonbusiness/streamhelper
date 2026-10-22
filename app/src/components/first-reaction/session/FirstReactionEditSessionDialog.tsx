import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { styled } from '@mui/material/styles'
import { type FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { FirstReactionRecord } from '@/api/first-reaction'
import { useNotification } from '@/context/NotificationContext'
import { usePatchFirstReactionSession } from '@/queries/use-first-reaction-session'

const FORM_ID = 'first-reaction-edit-session-form'

type FirstReactionEditSessionDialogProps = {
  accountId: number
  firstReactionId: number
  record: FirstReactionRecord | null
  open: boolean
  onClose: () => void
}

const StyledFormStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2.5),
  paddingTop: theme.spacing(1),
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

export function FirstReactionEditSessionDialog({
  accountId,
  firstReactionId,
  record,
  open,
  onClose,
}: FirstReactionEditSessionDialogProps) {
  const { t } = useTranslation()
  const { showSuccess, showError } = useNotification()
  const [title, setTitle] = useState('')
  const patchMutation = usePatchFirstReactionSession(accountId, firstReactionId)

  useEffect(() => {
    if (!open || !record) {
      return
    }
    setTitle(record.title)
  }, [open, record])

  const handleClose = () => {
    if (patchMutation.isPending) {
      return
    }
    onClose()
    patchMutation.reset()
  }

  const trimmedTitle = title.trim()
  const canSave =
    Boolean(record) &&
    trimmedTitle.length > 0 &&
    trimmedTitle !== record?.title.trim()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!record || !canSave) {
      return
    }

    patchMutation.mutate(
      { title: trimmedTitle },
      {
        onSuccess: () => {
          showSuccess(t('firstReaction.sessionUpdated'))
          handleClose()
        },
        onError: (error) =>
          showError(
            error instanceof Error
              ? error.message
              : t('firstReaction.couldNotUpdateSession'),
          ),
      },
    )
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('common.edit')}</DialogTitle>
      <DialogContent>
        <form id={FORM_ID} onSubmit={handleSubmit}>
          <StyledFormStack>
            <StyledTitleField
              autoFocus
              fullWidth
              size="small"
              label={t('firstReaction.sessionTitleLabel')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </StyledFormStack>
        </form>
      </DialogContent>
      <StyledDialogActions>
        <Button
          type="button"
          variant="outlined"
          onClick={handleClose}
          disabled={patchMutation.isPending}
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          form={FORM_ID}
          variant="contained"
          startIcon={<SaveIcon fontSize="small" aria-hidden />}
          loading={patchMutation.isPending}
          loadingPosition="start"
          disabled={!canSave}
        >
          {t('common.save')}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
