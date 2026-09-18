import * as yup from 'yup'

const hexColorPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
const winPercentPattern = /^\d+(\.\d{1,2})?$/

export type PrizeSpinSectorDraft = {
  label: string
  winPercent: string
  color: string
}

export type PrizeSpinSectorValidationContext = {
  existingTotal: number
  previousPercent?: number
}

export function validationErrorMessage(error: unknown): string {
  if (error instanceof yup.ValidationError) {
    return error.errors[0] ?? 'Validation failed'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Validation failed'
}

export function createPrizeSpinSectorFormSchema(
  context?: PrizeSpinSectorValidationContext,
) {
  return yup.object({
    label: yup
      .string()
      .trim()
      .required('Label is required')
      .max(100, 'Label must be at most 100 characters'),
    winPercent: yup
      .string()
      .required('Win % is required')
      .test('format', 'Win % must have at most 2 decimal places', (value) => {
        if (!value) {
          return false
        }
        return winPercentPattern.test(value.trim())
      })
      .test('range', 'Win % must be greater than 0 and at most 100', (value) => {
        if (!value) {
          return false
        }
        const parsed = Number.parseFloat(value.trim())
        return Number.isFinite(parsed) && parsed > 0 && parsed <= 100
      }),
    color: yup
      .string()
      .required('Color is required')
      .test('hex', 'Color must be a valid hex color', (value) => {
        if (!value) {
          return false
        }
        return hexColorPattern.test(value.trim())
      }),
  }).test(
    'total-percent',
    'Total win % for all sectors cannot exceed 100%',
    (value) => {
      if (!value || !context) {
        return true
      }

      const parsed = Number.parseFloat(value.winPercent.trim())
      const previous = context.previousPercent ?? 0
      const newTotal = context.existingTotal - previous + parsed
      return Number(newTotal.toFixed(2)) <= 100
    },
  )
}

export function validatePrizeSpinSectorDraft(
  draft: PrizeSpinSectorDraft,
  context?: PrizeSpinSectorValidationContext,
): string | null {
  try {
    createPrizeSpinSectorFormSchema(context).validateSync(draft, {
      abortEarly: true,
    })
    return null
  } catch (error) {
    return validationErrorMessage(error)
  }
}

const participantNickSchema = yup.object({
  participantNick: yup
    .string()
    .trim()
    .required('Enter a participant nick')
    .max(100, 'Participant nick must be at most 100 characters'),
})

export function validateParticipantNick(participantNick: string): string | null {
  try {
    participantNickSchema.validateSync({ participantNick }, { abortEarly: true })
    return null
  } catch (error) {
    return validationErrorMessage(error)
  }
}

export type CreatePrizeSpinFormValues = {
  title: string
}

export const createPrizeSpinFormSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required('Title is required')
    .max(200, 'Title must be at most 200 characters'),
})

export type PrizeSpinWidgetSettingsFormValues = {
  width: number
  height: number
}

const widgetDimensionSchema = (label: string) =>
  yup
    .number()
    .typeError(`${label} must be a number`)
    .required(`${label} is required`)
    .integer(`${label} must be a whole number`)
    .min(200, `${label} must be between 200 and 2400 px.`)
    .max(2400, `${label} must be between 200 and 2400 px.`)

export const prizeSpinWidgetSettingsFormSchema = yup.object({
  width: widgetDimensionSchema('Width'),
  height: widgetDimensionSchema('Height'),
})
