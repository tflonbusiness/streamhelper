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
import { isChatRollArchived, type ChatRollRecord } from '@/api/chat-roll'
import { useNotification } from '@/context/NotificationContext'
import { formatChatRollWidgetLine } from '@/lib/format-chat-roll-widget-line'
import {
  type ChatRollStreamWidgetSettingsFormValues,
  createChatRollStreamWidgetSettingsFormSchema,
} from '@/lib/chat-roll-validation'
import { WIDGET_KEYWORD_PREFIX_MAX_LENGTH } from '@/lib/chat-roll-session-settings'
import { useChatRolls } from '@/queries/use-chat-rolls'
import { usePatchChatRollStreamWidgetSettings } from '@/queries/use-chat-roll-stream-widget-settings'

type ChatRollStreamWidgetSettingsDialogProps = {
  accountId: number
  open: boolean
  onClose: () => void
}

const StyledBodyText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}))

const StyledFormStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
  paddingTop: theme.spacing(1),
}))

const StyledField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
}))

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(2),
}))

function pickWidgetSettingsSession(
  records: ChatRollRecord[],
): ChatRollRecord | null {
  const live = records.find(
    (record) => record.status === 'live' && !isChatRollArchived(record),
  )
  if (live) {
    return live
  }
  return records[0] ?? null
}

export const ChatRollStreamWidgetSettingsDialog = (
  props: ChatRollStreamWidgetSettingsDialogProps,
) => {
  const { t } = useTranslation()
  const validationSchema = useMemo(
    () => createChatRollStreamWidgetSettingsFormSchema(t),
    [t],
  )
  const { showSuccess, showError } = useNotification()

  const listParams = useMemo(
    () => ({ archived: 'false' as const, page: 1, limit: 20 }),
    [],
  )

  const {
    data: listData,
    isLoading: listLoading,
    error: listError,
  } = useChatRolls(props.accountId, listParams)

  const targetSession = useMemo(
    () => pickWidgetSettingsSession(listData?.records ?? []),
    [listData?.records],
  )

  const patchMutation = usePatchChatRollStreamWidgetSettings(props.accountId)

  const defaultValues: ChatRollStreamWidgetSettingsFormValues = {
    widgetKeywordPrefix: '',
  }

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isValid, isDirty },
  } = useForm({
    defaultValues,
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  })

  const watchedPrefix = watch('widgetKeywordPrefix')

  useEffect(() => {
    if (!props.open || !targetSession) {
      return
    }

    reset({
      widgetKeywordPrefix: targetSession.widgetKeywordPrefix,
    })
  }, [props.open, targetSession, reset])

  const handleClose = () => {
    props.onClose()
    reset(defaultValues)
    if (!patchMutation.isPending) {
      patchMutation.reset()
    }
  }

  const onSubmit = handleSubmit((values) => {
    if (!targetSession) {
      return
    }

    patchMutation.mutate(
      {
        chatRollId: targetSession.id,
        body: {
          widget_keyword_prefix: values.widgetKeywordPrefix.trim(),
        },
      },
      {
        onSuccess: () => {
          showSuccess(t('chatRoll.widgetSettingsSaved'))
          handleClose()
        },
        onError: () => showError(t('chatRoll.couldNotSaveWidgetSettings')),
      },
    )
  })

  const previewLine = formatChatRollWidgetLine(
    watchedPrefix || '…',
    targetSession?.keyword ?? '…',
  )

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('chatRoll.streamWidgetSettingsTitle')}</DialogTitle>
      <DialogContent>
        {listLoading ? (
          <StyledBodyText variant="body2">{t('common.loadingSettings')}</StyledBodyText>
        ) : listError ? (
          <StyledBodyText variant="body2">
            {t('chatRoll.couldNotLoadWidgetSettings')}
          </StyledBodyText>
        ) : !targetSession ? (
          <StyledBodyText variant="body2">
            {t('chatRoll.streamWidgetSettingsNoSession')}
          </StyledBodyText>
        ) : (
          <Box component="form" id="chat-roll-stream-widget-settings-form" onSubmit={onSubmit}>
            <StyledFormStack>
              {targetSession.status !== 'live' ? (
                <StyledBodyText variant="body2">
                  {t('chatRoll.streamWidgetSettingsOffAirHint', {
                    title: targetSession.title,
                  })}
                </StyledBodyText>
              ) : null}
              <Controller
                name="widgetKeywordPrefix"
                control={control}
                render={({ field, fieldState }) => (
                  <StyledField
                    {...field}
                    label={t('chatRoll.widgetKeywordPrefixLabel')}
                    size="small"
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={
                      fieldState.error?.message ??
                      t('chatRoll.widgetKeywordPrefixHelp', { preview: previewLine })
                    }
                    slotProps={{
                      htmlInput: { maxLength: WIDGET_KEYWORD_PREFIX_MAX_LENGTH },
                    }}
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
          form="chat-roll-stream-widget-settings-form"
          variant="contained"
          loading={patchMutation.isPending}
          loadingPosition="start"
          disabled={
            !targetSession ||
            listLoading ||
            Boolean(listError) ||
            !isValid ||
            !isDirty
          }
        >
          {t('common.save')}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
