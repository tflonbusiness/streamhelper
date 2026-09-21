import { Box, Stack, TextField } from '@mui/material'
import { styled } from '@mui/material/styles'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { BonusBuyRecord } from '@/api/bonus-buy'
import {
  type EditBonusBuySessionFormValues,
  editBonusBuySessionFormSchema,
} from '@/lib/bonus-buy-validation'

export type BonusBuyEditSessionFormProps = {
  formId: string
  record: BonusBuyRecord | null
  open: boolean
  onSubmit: (values: EditBonusBuySessionFormValues) => void
  onValidChange?: (isValid: boolean) => void
}

const emptyValues: EditBonusBuySessionFormValues = {
  name: '',
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
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm({
    defaultValues: emptyValues,
    resolver: yupResolver(editBonusBuySessionFormSchema),
    mode: 'onChange',
  })

  useEffect(() => {
    if (props.open && props.record) {
      reset({
        name: props.record.name,
        startBalance: props.record.startBalance,
      })
    }
  }, [props.open, props.record, reset])

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
              label="Name"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              autoFocus
              fullWidth
            />
          )}
        />
        <Controller
          name="startBalance"
          control={control}
          render={({ field, fieldState }) => (
            <StyledTextField
              {...field}
              label="Start balance ($)"
              type="number"
              slotProps={{
                htmlInput: { step: '0.01', min: 0, inputMode: 'decimal' },
              }}
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
