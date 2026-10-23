import type { TFunction } from 'i18next'
import * as yup from 'yup'

export type GrowingJackpotSessionTitleFormValues = {
  title: string
}

export function createGrowingJackpotSessionTitleFormSchema(t: TFunction) {
  return yup.object({
    title: yup
      .string()
      .trim()
      .required(t('validation.titleRequired'))
      .min(1, t('validation.titleRange'))
      .max(200, t('validation.titleRange')),
  })
}

export type GrowingJackpotWidgetSettingsFormValues = {
  width: number
  height: number
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

export function createGrowingJackpotWidgetSettingsFormSchema(t: TFunction) {
  const widthLabel = t('common.width')
  const heightLabel = t('common.height')
  return yup.object({
    width: widgetDimensionSchema(t, widthLabel),
    height: widgetDimensionSchema(t, heightLabel),
  })
}
