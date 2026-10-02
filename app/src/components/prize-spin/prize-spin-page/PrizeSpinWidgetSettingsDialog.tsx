import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNotification } from '@/context/NotificationContext'
import { WidgetSettingsDialogTitle } from '@/components/widget/WidgetSettingsPaletteIcon'
import {
  type PrizeSpinWidgetSettingsFormValues,
  createPrizeSpinWidgetSettingsFormSchema,
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
  equalSectorSlices: PRIZE_SPIN_WIDGET_DEFAULTS.equalSectorSlices,
  showSectorWeightInWinner: PRIZE_SPIN_WIDGET_DEFAULTS.showSectorWeightInWinner,
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
  const { t } = useTranslation()
  const validationSchema = useMemo(
    () => createPrizeSpinWidgetSettingsFormSchema(t),
    [t],
  )
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
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  })

  useEffect(() => {
    if (props.open && widgetSettings) {
      reset({
        width: widgetSettings.width,
        height: widgetSettings.height,
        equalSectorSlices: widgetSettings.equalSectorSlices,
        showSectorWeightInWinner:
          widgetSettings.showSectorWeightInWinner ??
          PRIZE_SPIN_WIDGET_DEFAULTS.showSectorWeightInWinner,
      })
    }
  }, [props.open, widgetSettings, reset])

  useEffect(() => {
    if (loadError) {
      showError(t('prizeSpin.couldNotLoadWidgetSettings'))
    }
  }, [loadError, showError, t])

  const handleClose = () => {
    props.onClose()
    reset(
      widgetSettings
        ? {
            width: widgetSettings.width,
            height: widgetSettings.height,
            equalSectorSlices: widgetSettings.equalSectorSlices,
            showSectorWeightInWinner:
              widgetSettings.showSectorWeightInWinner ??
              PRIZE_SPIN_WIDGET_DEFAULTS.showSectorWeightInWinner,
          }
        : defaultValues,
    )

    if (!patchMutation.isPending) {
      patchMutation.reset()
    }
  }

  const onSubmit = handleSubmit((values) => {
    patchMutation.mutate(
      {
        width: values.width,
        height: values.height,
        equalSectorSlices: values.equalSectorSlices,
        showSectorWeightInWinner: values.showSectorWeightInWinner,
      },
      {
        onSuccess: () => {
          showSuccess(t('prizeSpin.widgetSettingsSaved'))
          handleClose()
          patchMutation.reset()
        },
        onError: () => {
          showError(t('prizeSpin.couldNotSaveWidgetSettings'))
        },
      },
    )
  })

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="xs" fullWidth>
      <WidgetSettingsDialogTitle>{t('prizeSpin.widgetSettingsTitle')}</WidgetSettingsDialogTitle>
      <DialogContent>
        {isLoading ? (
          <StyledLoadingText>{t('common.loading')}</StyledLoadingText>
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
                    label={t('common.width')}
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
                    label={t('common.height')}
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
                name="equalSectorSlices"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    sx={{ alignItems: 'flex-start', mx: 0 }}
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(_, checked) => field.onChange(checked)}
                        sx={{ pt: 0.5 }}
                      />
                    }
                    label={
                      <Box>
                        <Typography component="span" variant="body2">
                          {t('prizeSpin.equalSectorSlices')}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 0.25 }}
                        >
                          {t('prizeSpin.equalSectorSlicesDescription')}
                        </Typography>
                      </Box>
                    }
                  />
                )}
              />
              <Controller
                name="showSectorWeightInWinner"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    sx={{ alignItems: 'flex-start', mx: 0 }}
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(_, checked) => field.onChange(checked)}
                        sx={{ pt: 0.5 }}
                      />
                    }
                    label={
                      <Box>
                        <Typography component="span" variant="body2">
                          {t('prizeSpin.showSectorWeightInWinner')}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 0.25 }}
                        >
                          {t('prizeSpin.showSectorWeightInWinnerDescription')}
                        </Typography>
                      </Box>
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
          form="prize-spin-widget-settings-form"
          variant="contained"
          loading={patchMutation.isPending}
          loadingPosition="start"
          disabled={isLoading || !isValid}
        >
          {t('common.save')}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
