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
import { styled } from '@mui/material/styles'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { HexColorField } from '@/components/bonus-buy/HexColorField'
import { StyledFormField } from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { useNotification } from '@/context/NotificationContext'
import { defaultSectorColor } from '@/lib/prize-spin-sector-colors'
import {
  type PrizeSpinSectorDraft,
  createPrizeSpinSectorFormSchema,
} from '@/lib/prize-spin-validation'
import { useCreatePrizeSpinSector } from '@/queries/use-prize-spin-session'

type PrizeSpinAddSectorDialogProps = {
  accountId: number
  prizeSpinId: number
  existingTotalWinPercent: number
  nextColorIndex: number
  open: boolean
  onClose: () => void
}

const StyledFormStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2.5),
  marginTop: theme.spacing(1),
}))

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(2),
}))

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
}))

export const PrizeSpinAddSectorDialog = (props: PrizeSpinAddSectorDialogProps) => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useNotification()
  const createMutation = useCreatePrizeSpinSector(
    props.accountId,
    props.prizeSpinId,
  )

  const defaultValues: PrizeSpinSectorDraft = {
    label: '',
    winPercent: '',
    color: defaultSectorColor(props.nextColorIndex),
  }

  const resolver = useMemo(
    () =>
      yupResolver(
        createPrizeSpinSectorFormSchema(t, {
          existingTotal: props.existingTotalWinPercent,
        }),
      ),
    [props.existingTotalWinPercent, t],
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm({
    defaultValues,
    resolver,
    mode: 'onChange',
  })

  useEffect(() => {
    if (props.open) {
      reset({
        label: '',
        winPercent: '',
        color: defaultSectorColor(props.nextColorIndex),
      })
    }
  }, [props.open, props.nextColorIndex, reset])

  const handleClose = () => {
    props.onClose()
    reset(defaultValues)

    if (!createMutation.isPending) {
      createMutation.reset()
    }
  }

  const onSubmit = handleSubmit((values) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        showSuccess(t('prizeSpin.sectorAdded'))
        handleClose()
        createMutation.reset()
      },
      onError: (error) => {
        showError(
          error instanceof Error ? error.message : t('prizeSpin.couldNotAddSector'),
        )
      },
    })
  })

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('prizeSpin.addSector')}</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          id="prize-spin-add-sector-form"
          onSubmit={onSubmit}
        >
          <StyledFormStack>
            <Controller
              name="label"
              control={control}
              render={({ field, fieldState }) => (
                <StyledTextField
                  {...field}
                  label={t('common.label')}
                  placeholder={t('prizeSpin.sectorLabelPlaceholder')}
                  required
                  autoFocus
                  fullWidth
                  size="small"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="winPercent"
              control={control}
              render={({ field, fieldState }) => (
                <StyledTextField
                  {...field}
                  label={t('common.winPercent')}
                  placeholder={t('prizeSpin.winChancePlaceholder')}
                  required
                  type="number"
                  slotProps={{
                    htmlInput: { min: 0.01, max: 100, step: 0.01 },
                  }}
                  fullWidth
                  size="small"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <StyledFormField>
                  <HexColorField
                    label={t('common.color')}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </StyledFormField>
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
          disabled={createMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="prize-spin-add-sector-form"
          variant="contained"
          loading={createMutation.isPending}
          loadingPosition="start"
          disabled={!isValid}
        >
          Add sector
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
