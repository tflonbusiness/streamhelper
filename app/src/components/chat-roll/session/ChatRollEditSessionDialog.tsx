import { useEffect, useMemo } from 'react'
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
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { styled } from '@mui/material/styles'
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm } from 'react-hook-form'
import type { ChatRollRecord } from '@/api/chat-roll'
import { useNotification } from '@/context/NotificationContext'
import {
  type CreateChatRollFormValues,
  createChatRollFormSchema,
} from '@/lib/chat-roll-validation'
import { usePatchChatRollSession } from '@/queries/use-chat-roll-session'

const FORM_ID = 'chat-roll-edit-session-form'

type ChatRollEditSessionDialogProps = {
  accountId: number
  chatRollId: number
  record: ChatRollRecord | null
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

export const ChatRollEditSessionDialog = (
  props: ChatRollEditSessionDialogProps,
) => {
  const { t } = useTranslation()
  const validationSchema = useMemo(() => createChatRollFormSchema(t), [t])
  const { showSuccess, showError } = useNotification()
  const patchMutation = usePatchChatRollSession(props.accountId, props.chatRollId)

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<CreateChatRollFormValues>({
    defaultValues: { title: '' },
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  })

  useEffect(() => {
    if (!props.open || !props.record) {
      return
    }
    reset({ title: props.record.title })
  }, [props.open, props.record, reset])

  const handleClose = () => {
    if (patchMutation.isPending) {
      return
    }

    props.onClose()
    patchMutation.reset()
  }

  const onSubmit = handleSubmit((values) => {
    if (!props.record) {
      return
    }

    patchMutation.mutate(
      { title: values.title },
      {
        onSuccess: () => {
          showSuccess(t('chatRoll.sessionUpdated'))
          handleClose()
        },
        onError: (error) => {
          showError(
            error instanceof Error
              ? error.message
              : t('chatRoll.couldNotUpdateSession'),
          )
        },
      },
    )
  })

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('common.edit')}</DialogTitle>
      <DialogContent>
        <Box component="form" id={FORM_ID} onSubmit={onSubmit}>
          <StyledFormStack>
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <StyledTitleField
                  {...field}
                  id="chat-roll-edit-title"
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
          disabled={!isValid || !props.record}
        >
          {t('common.save')}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
