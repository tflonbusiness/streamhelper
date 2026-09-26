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
  type PrizeSpinWidgetSettingsFormValues,
  prizeSpinWidgetSettingsFormSchema,
} from '@/lib/prize-spin-validation'
import { PRIZE_SPIN_WIDGET_DEFAULTS } from '@/lib/prize-spin-widget-defaults'
import {
  usePatchPrizeSpinWidget,
  usePrizeSpinWidget,
} from '@/queries/use-prize-spins'

type PrizeSpinWidgetSettingsDialogProps = {
  accountId: number
  open: boolean
  onClose: () => void
}

const defaultValues: PrizeSpinWidgetSettingsFormValues = {
  width: PRIZE_SPIN_WIDGET_DEFAULTS.width,
  height: PRIZE_SPIN_WIDGET_DEFAULTS.height,
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

export const PrizeSpinWidgetSettingsDialog = (
  props: PrizeSpinWidgetSettingsDialogProps,
) => {
  const { showSuccess, showError } = useNotification()

  const {
    data: widgetSettings,
    isLoading,
    error: loadError,
  } = usePrizeSpinWidget(props.accountId, props.open)

  const patchMutation = usePatchPrizeSpinWidget(props.accountId)

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm({
    defaultValues,
    resolver: yupResolver(prizeSpinWidgetSettingsFormSchema),
    mode: 'onChange',
  })

  useEffect(() => {
    if (props.open && widgetSettings) {
      reset({
        width: widgetSettings.width,
        height: widgetSettings.height,
      })
    }
  }, [props.open, widgetSettings, reset])

  useEffect(() => {
    if (loadError) {
      showError('Could not load widget settings.')
    }
  }, [loadError, showError])

  const handleClose = () => {
    props.onClose()
    reset(
      widgetSettings
        ? { width: widgetSettings.width, height: widgetSettings.height }
        : defaultValues,
    )

    if (!patchMutation.isPending) {
      patchMutation.reset()
    }
  }

  const onSubmit = handleSubmit((values) => {
    patchMutation.mutate(
      { width: values.width, height: values.height },
      {
        onSuccess: () => {
          showSuccess('Widget settings saved.')
          handleClose()
          patchMutation.reset()
        },
        onError: () => {
          showError('Could not save widget settings.')
        },
      },
    )
  })

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Widget settings</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <StyledLoadingText>Loading settings…</StyledLoadingText>
        ) : (
          <Box
            component="form"
            id="prize-spin-widget-settings-form"
            onSubmit={onSubmit}
          >
            <StyledFormStack>
              <Controller
                name="width"
                control={control}
                render={({ field, fieldState }) => (
                  <StyledSizeField
                    {...field}
                    label="Width"
                    type="number"
                    value={field.value}
                    onChange={(event) => {
                      const value = event.target.value
                      field.onChange(
                        value === '' ? Number.NaN : Number.parseInt(value, 10),
                      )
                    }}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    slotProps={{
                      htmlInput: { min: 200, max: 2400, step: 1 },
                    }}
                    fullWidth
                    size="small"
                  />
                )}
              />
              <Controller
                name="height"
                control={control}
                render={({ field, fieldState }) => (
                  <StyledSizeField
                    {...field}
                    label="Height"
                    type="number"
                    value={field.value}
                    onChange={(event) => {
                      const value = event.target.value
                      field.onChange(
                        value === '' ? Number.NaN : Number.parseInt(value, 10),
                      )
                    }}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    slotProps={{
                      htmlInput: { min: 200, max: 2400, step: 1 },
                    }}
                    fullWidth
                    size="small"
                  />
                )}
              />
            </StyledFormStack>
          </Box>
        )}
      </DialogContent>
      <StyledDialogActions>
        <Button type="button" variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="prize-spin-widget-settings-form"
          variant="contained"
          loading={patchMutation.isPending}
          loadingPosition="start"
          disabled={isLoading || !isValid}
        >
          Save
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
