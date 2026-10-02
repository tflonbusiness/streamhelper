import type { TFunction } from 'i18next'
import * as yup from 'yup'
import i18n from '@/i18n/init-i18n'

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
    return error.errors[0] ?? i18n.t('errors.validationFailed')
  }
  if (error instanceof Error) {
    return error.message
  }
  return i18n.t('errors.validationFailed')
}

export function createPrizeSpinSectorFormSchema(
  t: TFunction,
  context?: PrizeSpinSectorValidationContext,
) {
  return yup
    .object({
      label: yup
        .string()
        .trim()
        .required(t('validation.labelRequired'))
        .max(100, t('validation.labelMax100')),
      winPercent: yup
        .string()
        .required(t('validation.winPercentRequired'))
        .test('format', t('validation.winPercentDecimals'), (value) => {
          if (!value) {
            return false
          }
          return winPercentPattern.test(value.trim())
        })
        .test('range', t('validation.winPercentRange'), (value) => {
          if (!value) {
            return false
          }
          const parsed = Number.parseFloat(value.trim())
          return Number.isFinite(parsed) && parsed > 0 && parsed <= 100
        }),
      color: yup
        .string()
        .required(t('validation.colorRequired'))
        .test('hex', t('validation.colorHex'), (value) => {
          if (!value) {
            return false
          }
          return hexColorPattern.test(value.trim())
        }),
    })
    .test('total-percent', t('validation.totalWinPercentMax'), (value) => {
      if (!value || !context) {
        return true
      }

      const parsed = Number.parseFloat(value.winPercent.trim())
      const previous = context.previousPercent ?? 0
      const newTotal = context.existingTotal - previous + parsed
      return Number(newTotal.toFixed(2)) <= 100
    })
}

export function validatePrizeSpinSectorDraft(
  draft: PrizeSpinSectorDraft,
  context?: PrizeSpinSectorValidationContext,
): string | null {
  try {
    createPrizeSpinSectorFormSchema(i18n.t.bind(i18n), context).validateSync(
      draft,
      {
        abortEarly: true,
      },
    )
    return null
  } catch (error) {
    return validationErrorMessage(error)
  }
}

export function createParticipantNickSchema(t: TFunction) {
  return yup.object({
    participantNick: yup
      .string()
      .trim()
      .required(t('validation.participantNickRequired'))
      .max(100, t('validation.participantNickMax100')),
  })
}

export function validateParticipantNick(participantNick: string): string | null {
  try {
    createParticipantNickSchema(i18n.t.bind(i18n)).validateSync(
      { participantNick },
      { abortEarly: true },
    )
    return null
  } catch (error) {
    return validationErrorMessage(error)
  }
}

export type CreatePrizeSpinFormValues = {
  title: string
}

export function createPrizeSpinFormSchema(t: TFunction) {
  return yup.object({
    title: yup
      .string()
      .trim()
      .required(t('validation.titleRequired'))
      .max(200, t('validation.titleMax200')),
  })
}

export type PrizeSpinWidgetSettingsFormValues = {
  width: number
  height: number
  equalSectorSlices: boolean
  showSectorWeightInWinner: boolean
}

function widgetDimensionSchema(t: TFunction, label: string) {
  return yup
    .number()
    .typeError(t('validation.dimensionType', { label }))
    .required(t('validation.dimensionRequired', { label }))
    .integer(t('validation.dimensionInteger', { label }))
    .min(200, t('validation.dimensionRange', { label }))
    .max(2400, t('validation.dimensionRange', { label }))
}

export function createPrizeSpinWidgetSettingsFormSchema(t: TFunction) {
  const widthLabel = t('common.width')
  const heightLabel = t('common.height')
  return yup.object({
    width: widgetDimensionSchema(t, widthLabel),
    height: widgetDimensionSchema(t, heightLabel),
    equalSectorSlices: yup.boolean().required(),
    showSectorWeightInWinner: yup.boolean().required(),
  })
}
