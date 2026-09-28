import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

type ChatRollSessionUnsavedLeaveDialogProps = {
  open: boolean
  onStay: () => void
  onLeave: () => void
}

export function ChatRollSessionUnsavedLeaveDialog(
  props: ChatRollSessionUnsavedLeaveDialogProps,
) {
  const { t } = useTranslation()

  return (
    <Dialog open={props.open} onClose={props.onStay} maxWidth="xs" fullWidth>
      <DialogTitle>{t('chatRoll.leaveUnsavedTitle')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('chatRoll.leaveUnsavedBody')}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onStay}>{t('chatRoll.leaveUnsavedStay')}</Button>
        <Button color="warning" onClick={props.onLeave}>
          {t('chatRoll.leaveUnsavedLeave')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
