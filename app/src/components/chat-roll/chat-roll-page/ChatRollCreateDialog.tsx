import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
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
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm } from 'react-hook-form'
import { CHAT_ROLL_DEFAULT_TITLE } from '@/components/chat-roll/chat-roll-page/chat-roll-page-utils'
import { useNotification } from '@/context/NotificationContext'
import {
  type CreateChatRollFormValues,
  createChatRollFormSchema,
} from '@/lib/chat-roll-validation'
import { useCreateChatRoll } from '@/queries/use-chat-rolls'

type ChatRollCreateDialogProps = {
  accountId: number
  open: boolean
  onClose: () => void
  onCreated?: () => void
}

const defaultValues: CreateChatRollFormValues = {
  title: CHAT_ROLL_DEFAULT_TITLE,
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

export const ChatRollCreateDialog = (props: ChatRollCreateDialogProps) => {
  const { t } = useTranslation()
  const validationSchema = useMemo(() => createChatRollFormSchema(t), [t])
  const { showSuccess, showError } = useNotification()
  const createMutation = useCreateChatRoll(props.accountId)

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm({
    defaultValues,
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  })

  const handleClose = () => {
    props.onClose()
    reset(defaultValues)

    if (!createMutation.isPending) {
      createMutation.reset()
    }
  }

  const onSubmit = handleSubmit((values) => {
    createMutation.mutate(values.title, {
      onSuccess: () => {
        showSuccess(t('chatRoll.sessionCreated'))
        props.onCreated?.()
        handleClose()
        createMutation.reset()
      },
      onError: () => showError(t('chatRoll.couldNotCreateSession')),
    })
  })

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('chatRoll.createDialogTitle')}</DialogTitle>
      <DialogContent>
        <StyledDescription variant="body2">
          {t('chatRoll.createDialogDescription')}
        </StyledDescription>
        <Box component="form" id="chat-roll-create-form" onSubmit={onSubmit}>
          <StyledFormStack>
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <StyledTitleField
                  {...field}
                  id="chat-roll-title"
                  label={t('common.title')}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  autoFocus
                  fullWidth
                  size="small"
                />
              )}
            />
          </StyledFormStack>
        </Box>
      </DialogContent>
      <StyledDialogActions>
        <Button type="button" variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="chat-roll-create-form"
          variant="contained"
          loading={createMutation.isPending}
          loadingPosition="start"
          disabled={!isValid}
        >
          Create
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
