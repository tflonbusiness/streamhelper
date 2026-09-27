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
import type { PrizeSpinSector } from '@/api/prize-spin'
import { HexColorField } from '@/components/bonus-buy/HexColorField'
import { StyledFormField } from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { useNotification } from '@/context/NotificationContext'
import { defaultSectorColor } from '@/lib/prize-spin-sector-colors'
import {
  type PrizeSpinSectorDraft,
  createPrizeSpinSectorFormSchema,
} from '@/lib/prize-spin-validation'
import { useUpdatePrizeSpinSector } from '@/queries/use-prize-spin-session'

type PrizeSpinEditSectorDialogProps = {
  accountId: number
  prizeSpinId: number
  existingTotalWinPercent: number
  sector: PrizeSpinSector | null
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

export const PrizeSpinEditSectorDialog = (
  props: PrizeSpinEditSectorDialogProps,
) => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useNotification()
  const updateMutation = useUpdatePrizeSpinSector(
    props.accountId,
    props.prizeSpinId,
  )

  const resolver = useMemo(
    () =>
      yupResolver(
        createPrizeSpinSectorFormSchema(t, {
          existingTotal: props.existingTotalWinPercent,
          previousPercent: props.sector
            ? Number.parseFloat(props.sector.winPercent)
            : undefined,
        }),
      ),
    [props.existingTotalWinPercent, props.sector, t],
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<PrizeSpinSectorDraft>({
    defaultValues: {
      label: '',
      winPercent: '',
      color: '#F59E0B',
    },
    resolver,
    mode: 'onChange',
  })

  useEffect(() => {
    if (props.sector) {
      reset({
        label: props.sector.label,
        winPercent: props.sector.winPercent,
        color: props.sector.color ?? defaultSectorColor(props.sector.sortOrder),
      })
    }
  }, [props.sector, reset])

  const handleClose = () => {
    props.onClose()

    if (!updateMutation.isPending) {
      updateMutation.reset()
    }
  }

  const onSubmit = handleSubmit((values) => {
    if (!props.sector) {
      return
    }

    updateMutation.mutate(
      {
        sectorId: props.sector.id,
        body: {
          label: values.label,
          win_percent: values.winPercent,
          color: values.color,
        },
      },
      {
        onSuccess: () => {
          showSuccess(t('prizeSpin.sectorUpdated'))
          handleClose()
          updateMutation.reset()
        },
        onError: (error) => {
          showError(
            error instanceof Error ? error.message : t('prizeSpin.couldNotUpdateSector'),
          )
        },
      },
    )
  })

  return (
    <Dialog
      open={props.sector !== null}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t('prizeSpin.editSectorTitle')}</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          id="prize-spin-edit-sector-form"
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
                required
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
        <Button type="button" variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="prize-spin-edit-sector-form"
          variant="contained"
          loading={updateMutation.isPending}
          loadingPosition="start"
          disabled={!isValid}
        >
          Save
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
