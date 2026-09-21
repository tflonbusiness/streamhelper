import * as yup from 'yup'

export const createBonusBuyFormSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Name is required')
    .max(200, 'Name must be at most 200 characters'),
  startBalance: yup
    .string()
    .required('Start balance is required')
    .matches(
      /^\d+(\.\d{1,2})?$/,
      'Start balance must have at most 2 decimal places',
    )
    .test('min', 'Start balance must be zero or greater', (value) => {
      if (!value) {
        return false
      }

      const parsed = Number.parseFloat(value)
      return Number.isFinite(parsed) && parsed >= 0
    }),
})

export type CreateBonusBuyFormValues = yup.InferType<typeof createBonusBuyFormSchema>

export const editBonusBuySessionFormSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Name is required')
    .max(200, 'Name must be at most 200 characters'),
  startBalance: yup
    .string()
    .required('Start balance is required')
    .matches(
      /^\d+(\.\d{1,2})?$/,
      'Start balance must have at most 2 decimal places',
    )
    .test('min', 'Start balance must be greater than zero', (value) => {
      if (!value) {
        return false
      }

      const parsed = Number.parseFloat(value)
      return Number.isFinite(parsed) && parsed > 0
    }),
})

export type EditBonusBuySessionFormValues = yup.InferType<
  typeof editBonusBuySessionFormSchema
>

const optionalMoneyField = (label: string) =>
  yup
    .string()
    .defined()
    .test(`${label}-empty`, `${label} must be a valid number`, (value) => {
      const trimmed = (value ?? '').trim()
      if (!trimmed) {
        return true
      }

      const parsed = Number.parseFloat(trimmed)
      return Number.isFinite(parsed) && parsed >= 0
    })
    .test(`${label}-decimals`, `${label} must have at most 2 decimal places`, (value) => {
      const trimmed = (value ?? '').trim()
      if (!trimmed) {
        return true
      }

      return /^\d+(\.\d{1,2})?$/.test(trimmed)
    })

export const editBonusBuySlotFormSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Slot name is required')
    .max(200, 'Slot name must be at most 200 characters'),
  providerName: yup
    .string()
    .defined()
    .max(200, 'Provider name must be at most 200 characters'),
  purchaseAmount: yup
    .string()
    .required('Purchase amount is required')
    .matches(
      /^\d+(\.\d{1,2})?$/,
      'Purchase amount must have at most 2 decimal places',
    )
    .test('min', 'Purchase amount must be greater than zero', (value) => {
      if (!value) {
        return false
      }

      const parsed = Number.parseFloat(value)
      return Number.isFinite(parsed) && parsed > 0
    }),
  winAmount: optionalMoneyField('Win amount'),
})

export type EditBonusBuySlotFormValues = yup.InferType<
  typeof editBonusBuySlotFormSchema
>
