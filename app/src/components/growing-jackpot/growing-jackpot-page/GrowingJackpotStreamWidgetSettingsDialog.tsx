import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm } from 'react-hook-form'
import { GrowingJackpotWidgetThemePresetPicker } from '@/components/growing-jackpot/GrowingJackpotWidgetThemePresetPicker'
import { GrowingJackpotWidgetStyleForm } from '@/components/growing-jackpot/growing-jackpot-page/GrowingJackpotWidgetStyleForm'
import { GrowingJackpotWidgetPreview } from '@/components/growing-jackpot/widget/GrowingJackpotWidgetPreview'
import { WidgetSettingsDialogTitle } from '@/components/widget/WidgetSettingsPaletteIcon'
import { useNotification } from '@/context/NotificationContext'
import { GROWING_JACKPOT_WIDGET_DEFAULTS } from '@/lib/growing-jackpot-widget-defaults'
import {
  GROWING_JACKPOT_WIDGET_PREVIEW_BACKDROP_DEFAULT,
  GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS,
  mergeGrowingJackpotWidgetStyle,
  type GrowingJackpotWidgetStyle,
} from '@/lib/growing-jackpot-widget-style-defaults'
import {
  GROWING_JACKPOT_WIDGET_THEME_PRESETS,
  applyGrowingJackpotWidgetPreset,
  matchGrowingJackpotWidgetPresetFromList,
} from '@/lib/growing-jackpot-widget-presets'
import {
  type GrowingJackpotWidgetSettingsFormValues,
  createGrowingJackpotWidgetSettingsFormSchema,
} from '@/lib/growing-jackpot-validation'
import {
  useGrowingJackpotWidget,
  usePatchGrowingJackpotWidget,
} from '@/queries/use-growing-jackpot-widget-settings'

type GrowingJackpotStreamWidgetSettingsDialogProps = {
  accountId: number
  open: boolean
  onClose: () => void
}

const defaultValues: GrowingJackpotWidgetSettingsFormValues = {
  width: GROWING_JACKPOT_WIDGET_DEFAULTS.width,
  height: GROWING_JACKPOT_WIDGET_DEFAULTS.height,
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

export function GrowingJackpotStreamWidgetSettingsDialog(
  props: GrowingJackpotStreamWidgetSettingsDialogProps,
) {
  const { t } = useTranslation()
  const validationSchema = useMemo(
    () => createGrowingJackpotWidgetSettingsFormSchema(t),
    [t],
  )
  const { showSuccess, showError } = useNotification()
  const [styleDraft, setStyleDraft] = useState<GrowingJackpotWidgetStyle>(
    GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS,
  )
  const [previewBackdrop, setPreviewBackdrop] = useState(
    GROWING_JACKPOT_WIDGET_PREVIEW_BACKDROP_DEFAULT,
  )

  const {
    data: widgetSettings,
    isLoading,
    error: loadError,
  } = useGrowingJackpotWidget(props.accountId, props.open)

  const patchMutation = usePatchGrowingJackpotWidget(props.accountId)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isValid },
  } = useForm({
    defaultValues,
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  })

  const width = watch('width')
  const height = watch('height')

  const activePresetId = useMemo(
    () => matchGrowingJackpotWidgetPresetFromList(styleDraft),
    [styleDraft],
  )

  useEffect(() => {
    if (props.open && widgetSettings) {
      reset({
        width: widgetSettings.width,
        height: widgetSettings.height,
      })
      setStyleDraft(
        mergeGrowingJackpotWidgetStyle(
          GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS,
          widgetSettings.style,
        ),
      )
    }
  }, [props.open, widgetSettings, reset])

  const onSubmit = handleSubmit((values) => {
    patchMutation.mutate(
      { width: values.width, height: values.height, style: styleDraft },
      {
        onSuccess: () => {
          showSuccess(t('growingJackpot.widgetSettingsSaved'))
          props.onClose()
        },
        onError: (error) =>
          showError(
            error instanceof Error
              ? error.message
              : t('growingJackpot.widgetSettingsCouldNotSave'),
          ),
      },
    )
  })

  const updateStyle = <K extends keyof GrowingJackpotWidgetStyle>(
    key: K,
    value: GrowingJackpotWidgetStyle[K],
  ) => {
    setStyleDraft((previous) => ({ ...previous, [key]: value }))
  }

  const applyPreset = (presetId: string) => {
    setStyleDraft((previous) =>
      applyGrowingJackpotWidgetPreset(previous, presetId),
    )
  }

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="md">
      <WidgetSettingsDialogTitle>
        {t('growingJackpot.widgetSettingsTitle')}
      </WidgetSettingsDialogTitle>
      <DialogContent>
        {isLoading ? (
          <StyledLoadingText>{t('common.loading')}</StyledLoadingText>
        ) : loadError ? (
          <StyledLoadingText color="error">
            {loadError instanceof Error
              ? loadError.message
              : t('growingJackpot.widgetSettingsLoadFailed')}
          </StyledLoadingText>
        ) : (
          <Stack spacing={3}>
            <StyledFormStack
              component="form"
              id="growing-jackpot-widget-settings-form"
              onSubmit={onSubmit}
              direction={{ xs: 'column', sm: 'row' }}
            >
              <Controller
                name="width"
                control={control}
                render={({ field, fieldState }) => (
                  <StyledSizeField
                    {...field}
                    type="number"
                    label={t('common.width')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    onChange={(e) =>
                      field.onChange(Number.parseInt(e.target.value, 10) || 0)
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
                    type="number"
                    label={t('common.height')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    onChange={(e) =>
                      field.onChange(Number.parseInt(e.target.value, 10) || 0)
                    }
                  />
                )}
              />
            </StyledFormStack>
            <GrowingJackpotWidgetThemePresetPicker
              presets={GROWING_JACKPOT_WIDGET_THEME_PRESETS}
              activePresetId={activePresetId}
              onSelectPreset={applyPreset}
            />
            <GrowingJackpotWidgetStyleForm draft={styleDraft} onUpdate={updateStyle} />
            <GrowingJackpotWidgetPreview
              width={width}
              height={height}
              styleDraft={styleDraft}
              previewBackdropColor={previewBackdrop}
              onPreviewBackdropColorChange={setPreviewBackdrop}
            />
          </Stack>
        )}
      </DialogContent>
      <StyledDialogActions>
        <Button type="button" onClick={props.onClose}>
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          form="growing-jackpot-widget-settings-form"
          variant="contained"
          disabled={!isValid || patchMutation.isPending || isLoading}
        >
          {t('common.save')}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
