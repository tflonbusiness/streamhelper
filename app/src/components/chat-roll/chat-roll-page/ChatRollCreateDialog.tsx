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
import { useNavigate } from 'react-router-dom'
import { CHAT_ROLL_DEFAULT_TITLE } from '@/components/chat-roll/chat-roll-page/chat-roll-page-utils'
import { useNotification } from '@/context/NotificationContext'
import {
  type CreateChatRollFormValues,
  createChatRollFormSchema,
} from '@/lib/chat-roll-validation'
import { chatRollSessionRoute } from '@/lib/routes'
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
  const navigate = useNavigate()
  const { showSuccess, showError } = useNotification()
  const createMutation = useCreateChatRoll(props.accountId)

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm({
    defaultValues,
    resolver: yupResolver(createChatRollFormSchema),
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
      onSuccess: (record) => {
        showSuccess('Chat roll session created.')
        props.onCreated?.()
        handleClose()
        createMutation.reset()
        navigate(chatRollSessionRoute(record.id))
      },
      onError: () => showError('Could not create chat roll session.'),
    })
  })

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Session</DialogTitle>
      <DialogContent>
        <StyledDescription variant="body2">
          Create a chat roll session with a title for your stream.
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
                  label="Title"
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
