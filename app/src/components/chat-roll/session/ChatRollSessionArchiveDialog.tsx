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
import { useNavigate } from 'react-router-dom'
import type { ChatRollRecord } from '@/api/chat-roll'
import { useNotification } from '@/context/NotificationContext'
import { CHAT_ROLL_ROUTE } from '@/lib/routes'
import { useArchiveChatRollSession } from '@/queries/use-chat-roll-session'

type ChatRollSessionArchiveDialogProps = {
  accountId: number
  chatRollId: number
  record: ChatRollRecord | null
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

export const ChatRollSessionArchiveDialog = (
  props: ChatRollSessionArchiveDialogProps,
) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { showSuccess, showError } = useNotification()
  const archiveMutation = useArchiveChatRollSession(
    props.accountId,
    props.chatRollId,
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
        showSuccess(t('chatRoll.sessionArchived'))
        handleClose()
        archiveMutation.reset()
        navigate(CHAT_ROLL_ROUTE)
      },
      onError: (error) => {
        showError(
          error instanceof Error ? error.message : t('chatRoll.couldNotArchiveSession'),
        )
      },
    })
  }

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('chatRoll.archiveSessionTitle')}</DialogTitle>
      <DialogContent>
        <StyledDescription variant="body2">
          {t('chatRoll.archiveListIntro', { title: props.record?.title ?? '' })}
          {' '}
          {t('chatRoll.archiveListOutro')}
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
