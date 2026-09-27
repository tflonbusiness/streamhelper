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
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNotification } from '@/context/NotificationContext'
import {
  type ChatRollWidgetSettingsFormValues,
  createChatRollWidgetSettingsFormSchema,
} from '@/lib/chat-roll-validation'
import {
  useChatRollWidget,
  usePatchChatRollWidget,
} from '@/queries/use-chat-rolls'

type ChatRollWidgetSettingsDialogProps = {
  accountId: number
  open: boolean
  onClose: () => void
}

const defaultValues: ChatRollWidgetSettingsFormValues = {
  width: 500,
  height: 500,
}

const StyledLoadingText = styled(Typography)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  color: theme.palette.text.secondary,
}))

const StyledFormStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
  paddingTop: theme.spacing(1),
}))

const StyledSizeField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
}))

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(2),
}))

export const ChatRollWidgetSettingsDialog = (
  props: ChatRollWidgetSettingsDialogProps,
) => {
  const { t } = useTranslation()
  const validationSchema = useMemo(
    () => createChatRollWidgetSettingsFormSchema(t),
    [t],
  )
  const { showSuccess, showError } = useNotification()

  const {
    data: widgetSettings,
    isLoading,
    error: loadError,
  } = useChatRollWidget(props.accountId, props.open)

  const patchMutation = usePatchChatRollWidget(props.accountId)

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

  useEffect(() => {
    if (!widgetSettings) {
      return
    }

    reset({
      width: widgetSettings.width,
      height: widgetSettings.height,
    })
  }, [widgetSettings, reset])

  const handleClose = () => {
    props.onClose()
    reset(defaultValues)

    if (!patchMutation.isPending) {
      patchMutation.reset()
    }
  }

  const onSubmit = handleSubmit((values) => {
    patchMutation.mutate(values, {
      onSuccess: () => {
        showSuccess(t('chatRoll.widgetSettingsSaved'))
        handleClose()
      },
      onError: () => showError(t('chatRoll.couldNotSaveWidgetSettings')),
    })
  })

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('chatRoll.widgetSettingsTitle')}</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <StyledLoadingText variant="body2">{t('common.loadingSettings')}</StyledLoadingText>
        ) : loadError ? (
          <StyledLoadingText variant="body2">
            {t('chatRoll.couldNotLoadWidgetSettings')}
          </StyledLoadingText>
        ) : (
          <Box component="form" id="chat-roll-widget-settings-form" onSubmit={onSubmit}>
            <StyledFormStack>
              <Controller
                name="width"
                control={control}
                render={({ field, fieldState }) => (
                  <StyledSizeField
                    {...field}
                    label={t('common.widthPx')}
                    type="number"
                    size="small"
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    onChange={(event) =>
                      field.onChange(Number.parseInt(event.target.value, 10))
                    }
                  />
                )}
              />
              <Controller
                name="height"
                control={control}
                render={({ field, fieldState }) => (
                  <StyledSizeField
                    {...field}
                    label={t('common.heightPx')}
                    type="number"
                    size="small"
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    onChange={(event) =>
                      field.onChange(Number.parseInt(event.target.value, 10))
                    }
                  />
                )}
              />
            </StyledFormStack>
          </Box>
        )}
      </DialogContent>
      <StyledDialogActions>
        <Button type="button" variant="outlined" onClick={handleClose}>
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          form="chat-roll-widget-settings-form"
          variant="contained"
          loading={patchMutation.isPending}
          loadingPosition="start"
          disabled={!isValid || isLoading || Boolean(loadError)}
        >
          {t('common.save')}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
