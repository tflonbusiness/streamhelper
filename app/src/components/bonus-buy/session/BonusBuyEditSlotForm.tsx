import { Box, Stack, TextField } from '@mui/material'
import { styled } from '@mui/material/styles'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { BonusBuySlot } from '@/api/bonus-buy'
import {
  type EditBonusBuySlotFormValues,
  editBonusBuySlotFormSchema,
} from '@/lib/bonus-buy-validation'
import {
  decimalMoneyInputSlotProps,
  sanitizeDecimalInput,
} from '@/lib/bonus-buy-format'

export type BonusBuyEditSlotFormProps = {
  formId: string
  slot: BonusBuySlot | null
  onSubmit: (values: EditBonusBuySlotFormValues) => void
  onValidChange?: (isValid: boolean) => void
}

const emptyValues: EditBonusBuySlotFormValues = {
  name: '',
  providerName: '',
  purchaseAmount: '',
  winAmount: '',
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

export const BonusBuyEditSlotForm = (props: BonusBuyEditSlotFormProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm({
    defaultValues: emptyValues,
    resolver: yupResolver(editBonusBuySlotFormSchema),
    mode: 'onChange',
  })

  useEffect(() => {
    if (props.slot) {
      reset({
        name: props.slot.name,
        providerName: props.slot.providerName ?? '',
        purchaseAmount: props.slot.purchaseAmount,
        winAmount: props.slot.winAmount ?? '',
      })
    }
  }, [props.slot, reset])

  useEffect(() => {
    props.onValidChange?.(isValid)
  }, [isValid, props.onValidChange])

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
              label="Slot Name"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              autoFocus
              fullWidth
            />
          )}
        />
        <Controller
          name="providerName"
          control={control}
          render={({ field, fieldState }) => (
            <StyledTextField
              {...field}
              label="Provider Name"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              fullWidth
            />
          )}
        />
        <Controller
          name="purchaseAmount"
          control={control}
          render={({ field, fieldState }) => (
            <StyledTextField
              {...field}
              label="Purchase ($)"
              type="text"
              onChange={(event) =>
                field.onChange(sanitizeDecimalInput(event.target.value))
              }
              slotProps={decimalMoneyInputSlotProps}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              fullWidth
            />
          )}
        />
        <Controller
          name="winAmount"
          control={control}
          render={({ field, fieldState }) => (
            <StyledTextField
              {...field}
              label="Win ($)"
              type="text"
              placeholder="Leave empty if pending"
              onChange={(event) =>
                field.onChange(sanitizeDecimalInput(event.target.value))
              }
              slotProps={decimalMoneyInputSlotProps}
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
