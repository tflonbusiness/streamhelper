import { Box, Stack, TextField } from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { styled } from '@mui/material/styles'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import type { BonusBuyRecord } from '@/api/bonus-buy'
import {
  type EditBonusBuySessionFormValues,
  createEditBonusBuySessionFormSchema,
} from '@/lib/bonus-buy-validation'
import { BonusBuyCurrencyField } from '@/components/bonus-buy/BonusBuyCurrencyField'
import { buildBonusBuyMoneyInputSlotProps } from '@/components/bonus-buy/bonus-buy-money-input'
import { sanitizeDecimalInput } from '@/lib/bonus-buy-format'

export type BonusBuyEditSessionFormProps = {
  formId: string
  record: BonusBuyRecord | null
  open: boolean
  onSubmit: (values: EditBonusBuySessionFormValues) => void
  onValidChange?: (isValid: boolean) => void
}

const emptyValues: EditBonusBuySessionFormValues = {
  name: '',
  currencyCode: 'USD',
  startBalance: '',
}

const StyledFormStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
  marginTop: theme.spacing(1),
}))

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
}))

export const BonusBuyEditSessionForm = (props: BonusBuyEditSessionFormProps) => {
  const { t } = useTranslation()
  const validationSchema = useMemo(
    () => createEditBonusBuySessionFormSchema(t),
    [t],
  )
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm({
    defaultValues: emptyValues,
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  })

  useEffect(() => {
    if (props.open && props.record) {
      reset({
        name: props.record.name,
        currencyCode: props.record.currencyCode ?? 'USD',
        startBalance: props.record.startBalance,
      })
    }
  }, [props.open, props.record, reset])

  useEffect(() => {
    props.onValidChange?.(isValid)
  }, [isValid, props.onValidChange])

  const currencyCode = useWatch({ control, name: 'currencyCode' })

  return (
    <Box
      component="form"
      id={props.formId}
      onSubmit={handleSubmit(props.onSubmit)}
      noValidate
    >
      <StyledFormStack>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <StyledTextField
              {...field}
              label={t('common.name')}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              autoFocus
              fullWidth
            />
          )}
        />
        <Controller
          name="currencyCode"
          control={control}
          render={({ field, fieldState }) => (
            <BonusBuyCurrencyField
              value={field.value}
              onChange={field.onChange}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="startBalance"
          control={control}
          render={({ field, fieldState }) => (
            <StyledTextField
              {...field}
              label={t('common.startBalance')}
              type="text"
              onChange={(event) =>
                field.onChange(sanitizeDecimalInput(event.target.value))
              }
              slotProps={buildBonusBuyMoneyInputSlotProps(currencyCode)}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              fullWidth
            />
          )}
        />
      </StyledFormStack>
    </Box>
  )
}
