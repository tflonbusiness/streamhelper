import { Box, Button, Grid, TextField } from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import AddIcon from '@mui/icons-material/Add'
import { alpha, styled } from '@mui/material/styles'
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm } from 'react-hook-form'
import type { BonusBuyRecord } from '@/api/bonus-buy'
import { isBonusBuyReadOnly } from '@/api/bonus-buy'
import { SectionHeader } from '@/components/SectionHeader'
import {
  StyledSessionCard,
  StyledSessionCardContent,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { useNotification } from '@/context/NotificationContext'
import {
  type CreateBonusBuySlotFormValues,
  createBonusBuySlotFormSchema,
} from '@/lib/bonus-buy-validation'
import { buildBonusBuyMoneyInputSlotProps } from '@/components/bonus-buy/bonus-buy-money-input'
import { sanitizeDecimalInput } from '@/lib/bonus-buy-format'
import { BonusBuySlotNameField } from '@/components/bonus-buy/BonusBuySlotNameField'
import { useCreateBonusBuySlot } from '@/queries/use-bonus-buy'
import { colors } from '@/theme/colors'

type BonusBuySessionAddSlotSectionProps = {
  accountId: number
  bonusBuyId: number
  record: BonusBuyRecord
  canAddSlot?: boolean
}

const defaultValues: CreateBonusBuySlotFormValues = {
  name: '',
  providerName: '',
  purchaseAmount: '',
}

const FormPanel = styled(Box)(({ theme }) => ({
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: 12,
  backgroundColor: alpha(colors.neutral[100], 0.02),
  padding: theme.spacing(2),
  transition: 'opacity 0.15s ease',
}))

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
}))

export const BonusBuySessionAddSlotSection = (
  props: BonusBuySessionAddSlotSectionProps,
) => {
  const { t } = useTranslation()
  const validationSchema = useMemo(() => createBonusBuySlotFormSchema(t), [t])
  const { showSuccess, showError } = useNotification()
  const createSlotMutation = useCreateBonusBuySlot(
    props.accountId,
    props.bonusBuyId,
  )
  const active =
    !isBonusBuyReadOnly(props.record) && (props.canAddSlot ?? true)

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

  const onSubmit = handleSubmit((values) => {
    if (!active) {
      return
    }

    createSlotMutation.mutate(
      {
        name: values.name,
        purchaseAmount: Number.parseFloat(values.purchaseAmount).toFixed(2),
        providerName: values.providerName.trim() || undefined,
      },
      {
        onSuccess: () => {
          reset(defaultValues)
          showSuccess(t('bonusBuy.slotAdded'))
          createSlotMutation.reset()
        },
        onError: (error) => {
          showError(
            error instanceof Error ? error.message : t('bonusBuy.couldNotAddSlot'),
          )
        },
      },
    )
  })

  return (
    <StyledSessionCard elevation={0}>
      <StyledSessionCardContent>
        <Box component="form" onSubmit={onSubmit} noValidate>
          <SectionHeader
            title={t('bonusBuy.quickAddSlot')}
            description={t('bonusBuy.quickAddSlotDescription')}
            icon={AddIcon}
            iconVariant="success"
            action={
              <Button
                type="submit"
                variant="contained"
                disabled={!active || !isValid}
                loading={createSlotMutation.isPending}
                loadingPosition="start"
                startIcon={<AddIcon fontSize="small" aria-hidden />}
                sx={{ flexShrink: 0 }}
              >
                {t('bonusBuy.addSlotButton')}
              </Button>
            }
          />
          <FormPanel sx={!active ? { opacity: 0.55 } : undefined}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <BonusBuySlotNameField
                      id="session-slot-name"
                      value={field.value}
                      onChange={field.onChange}
                      required
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      disabled={!active || createSlotMutation.isPending}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="providerName"
                  control={control}
                  render={({ field, fieldState }) => (
                    <StyledTextField
                      {...field}
                      id="session-nick-provider"
                      label={t('common.usernameNote')}
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      disabled={!active || createSlotMutation.isPending}
                      fullWidth
                      size="small"
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="purchaseAmount"
                  control={control}
                  render={({ field, fieldState }) => (
                    <StyledTextField
                      {...field}
                      id="session-purchase"
                      label={t('common.purchase')}
                      required
                      type="text"
                      onChange={(event) =>
                        field.onChange(sanitizeDecimalInput(event.target.value))
                      }
                      slotProps={buildBonusBuyMoneyInputSlotProps(
                        props.record.currencyCode,
                      )}
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      disabled={!active || createSlotMutation.isPending}
                      fullWidth
                      size="small"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </FormPanel>
        </Box>
      </StyledSessionCardContent>
    </StyledSessionCard>
  )
}
