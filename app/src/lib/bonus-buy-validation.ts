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
