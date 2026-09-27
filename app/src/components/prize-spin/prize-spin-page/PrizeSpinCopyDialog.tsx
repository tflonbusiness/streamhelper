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
import { useNavigate } from 'react-router-dom'
import type { PrizeSpinRecord } from '@/api/prize-spin'
import {
  defaultCopyPrizeSpinTitle,
  PRIZE_SPIN_DEFAULT_TITLE,
} from '@/components/prize-spin/prize-spin-page/prize-spin-page-utils'
import { useNotification } from '@/context/NotificationContext'
import {
  type CreatePrizeSpinFormValues,
  createPrizeSpinFormSchema,
} from '@/lib/prize-spin-validation'
import { prizeSpinSessionRoute } from '@/lib/routes'
import { useCopyPrizeSpin } from '@/queries/use-prize-spins'

type PrizeSpinCopyDialogProps = {
  accountId: number
  open: boolean
  record?: PrizeSpinRecord | null
  onClose: () => void
}

const StyledDescription = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.text.secondary,
}))

const StyledSourceTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  color: theme.palette.text.primary,
  fontWeight: 500,
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

export const PrizeSpinCopyDialog = (props: PrizeSpinCopyDialogProps) => {
  const { t } = useTranslation()
  const validationSchema = useMemo(() => createPrizeSpinFormSchema(t), [t])
  const navigate = useNavigate()
  const { showSuccess, showError } = useNotification()
  const copyMutation = useCopyPrizeSpin(props.accountId)

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm({
    defaultValues: { title: PRIZE_SPIN_DEFAULT_TITLE },
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  })

  useEffect(() => {
    if (!props.open || !props.record) {
      return
    }

    reset({ title: defaultCopyPrizeSpinTitle(props.record.title) })
  }, [props.open, props.record, reset])

  const handleClose = () => {
    props.onClose()

    if (!copyMutation.isPending) {
      copyMutation.reset()
    }
  }

  const onSubmit = handleSubmit((values: CreatePrizeSpinFormValues) => {
    if (!props.record) {
      showError(t('prizeSpin.noSessionToCopy'))
      return
    }

    copyMutation.mutate(
      { sourcePrizeSpinId: props.record.id, title: values.title },
      {
        onSuccess: (created) => {
          showSuccess(t('prizeSpin.sessionCopied'))
          handleClose()
          copyMutation.reset()
          navigate(prizeSpinSessionRoute(created.id))
        },
        onError: () => showError(t('prizeSpin.couldNotCopySession')),
      },
    )
  })

  return (
    <Dialog
      open={props.open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t('prizeSpin.copySessionTitle')}</DialogTitle>
      <DialogContent>
        <StyledDescription variant="body2">
          {t('prizeSpin.copySessionDescription')}
        </StyledDescription>
        {props.record ? (
          <StyledSourceTitle variant="body2">
            {t('prizeSpin.copySessionSource', { title: props.record.title })}
          </StyledSourceTitle>
        ) : null}
        <Box
          component="form"
          id="prize-spin-copy-form"
          onSubmit={onSubmit}
        >
          <StyledFormStack>
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <StyledTitleField
                  {...field}
                  id="prize-spin-copy-title"
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
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          form="prize-spin-copy-form"
          variant="contained"
          loading={copyMutation.isPending}
          loadingPosition="start"
          disabled={!isValid || !props.record}
        >
          {t('prizeSpin.createCopy')}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
