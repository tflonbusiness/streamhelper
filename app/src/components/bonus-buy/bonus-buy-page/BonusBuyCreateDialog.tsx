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
import { Controller, useForm } from 'react-hook-form'
import {
  BONUS_BUY_DEFAULT_NAME,
} from '@/components/bonus-buy/bonus-buy-page/bonus-buy-page-utils'
import { useNotification } from '@/context/NotificationContext'
import {
  type CreateBonusBuyFormValues,
  createBonusBuyFormSchema,
} from '@/lib/bonus-buy-validation'
import {
  decimalMoneyInputSlotProps,
  sanitizeDecimalInput,
} from '@/lib/bonus-buy-format'
import { useCreateBonusBuy } from '@/queries/use-bonus-buy'

type BonusBuyCreateDialogProps = {
  accountId: number
  open: boolean
  onClose: () => void
  onCreated?: () => void
}

const defaultValues: CreateBonusBuyFormValues = {
  name: BONUS_BUY_DEFAULT_NAME,
  startBalance: '0',
}

const StyledDescription = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  color: theme.palette.text.secondary,
}))

const StyledFormStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2.5),
}))

const StyledField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
}))

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(2),
}))

export const BonusBuyCreateDialog = (props: BonusBuyCreateDialogProps) => {
  const { showSuccess, showError } = useNotification()
  const createMutation = useCreateBonusBuy(props.accountId)

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm({
    defaultValues,
    resolver: yupResolver(createBonusBuyFormSchema),
    mode: 'onChange',
  })

  const handleClose = () => {
    props.onClose()
    reset(defaultValues)

    if (!createMutation.isPending) {
      createMutation.reset()
    }
  }

  const onSubmit = handleSubmit((values) => {
    createMutation.mutate(
      { name: values.name, startBalance: values.startBalance },
      {
        onSuccess: () => {
          showSuccess('Bonus buy session created.')
          props.onCreated?.()
          handleClose()
          createMutation.reset()
        },
        onError: (error) => {
          showError(
            error instanceof Error
              ? error.message
              : 'Could not create bonus buy session.',
          )
        },
      },
    )
  })

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Bonus Buy</DialogTitle>
      <DialogContent>
        <StyledDescription variant="body2">
          Create a bonus buy session with a name and starting balance in USD.
        </StyledDescription>
        <Box component="form" id="bonus-buy-create-form" onSubmit={onSubmit}>
          <StyledFormStack>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <StyledField
                  {...field}
                  id="bonus-buy-name"
                  label="Name"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  autoFocus
                  fullWidth
                  size="small"
                />
              )}
            />
            <Controller
              name="startBalance"
              control={control}
              render={({ field, fieldState }) => (
                <StyledField
                  {...field}
                  id="bonus-buy-balance"
                  label="Start balance (USD)"
                  type="text"
                  onChange={(event) =>
                    field.onChange(sanitizeDecimalInput(event.target.value))
                  }
                  slotProps={decimalMoneyInputSlotProps}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
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
          Cancel
        </Button>
        <Button
          type="submit"
          form="bonus-buy-create-form"
          variant="contained"
          loading={createMutation.isPending}
          loadingPosition="start"
          disabled={!isValid}
        >
          Create
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
