import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
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
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm } from 'react-hook-form'
import type { GrowingJackpotRecord } from '@/api/growing-jackpot'
import { useNotification } from '@/context/NotificationContext'
import {
  type GrowingJackpotSessionTitleFormValues,
  createGrowingJackpotSessionTitleFormSchema,
} from '@/lib/growing-jackpot-validation'
import { usePatchGrowingJackpotSession } from '@/queries/use-growing-jackpot-session'

const FORM_ID = 'growing-jackpot-edit-session-form'

type GrowingJackpotEditSessionDialogProps = {
  accountId: number
  growingJackpotId: number
  record: GrowingJackpotRecord | null
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

export function GrowingJackpotEditSessionDialog(
  props: GrowingJackpotEditSessionDialogProps,
) {
  const { t } = useTranslation()
  const validationSchema = useMemo(
    () => createGrowingJackpotSessionTitleFormSchema(t),
    [t],
  )
  const { showSuccess, showError } = useNotification()
  const patchMutation = usePatchGrowingJackpotSession(
    props.accountId,
    props.growingJackpotId,
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<GrowingJackpotSessionTitleFormValues>({
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
  }

  const onSubmit = handleSubmit((values) => {
    patchMutation.mutate(
      { title: values.title.trim() },
      {
        onSuccess: () => {
          showSuccess(t('growingJackpot.sessionTitleSaved'))
          props.onClose()
        },
        onError: (error) =>
          showError(
            error instanceof Error
              ? error.message
              : t('growingJackpot.couldNotSaveSessionTitle'),
          ),
      },
    )
  })

  return (
    <Dialog open={props.open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('growingJackpot.editSessionTitle')}</DialogTitle>
      <DialogContent>
        <form id={FORM_ID} onSubmit={onSubmit}>
          <StyledFormStack>
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <StyledTitleField
                  {...field}
                  autoFocus
                  label={t('growingJackpot.sessionTitleLabel')}
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </StyledFormStack>
        </form>
      </DialogContent>
      <StyledDialogActions>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button
          type="submit"
          form={FORM_ID}
          variant="contained"
          startIcon={<SaveIcon fontSize="small" aria-hidden />}
          disabled={!isValid || patchMutation.isPending}
        >
          {t('common.save')}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
