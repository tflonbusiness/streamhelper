import type { TFunction } from 'i18next'
import * as yup from 'yup'

export type CreateChatRollFormValues = {
  title: string
}

export function createChatRollFormSchema(t: TFunction) {
  return yup.object({
    title: yup
      .string()
      .trim()
      .required(t('validation.titleRequired'))
      .min(1, t('validation.titleRange'))
      .max(200, t('validation.titleRange')),
  })
}

export type ChatRollWidgetSettingsFormValues = {
  width: number
  height: number
}

export function createChatRollWidgetSettingsFormSchema(t: TFunction) {
  const widthLabel = t('common.width')
  const heightLabel = t('common.height')
  return yup.object({
    width: yup
      .number()
      .typeError(t('validation.dimensionType', { label: widthLabel }))
      .required(t('validation.dimensionRequired', { label: widthLabel }))
      .integer(t('validation.widthInteger'))
      .min(200, t('validation.widthRange'))
      .max(2400, t('validation.widthRange')),
    height: yup
      .number()
      .typeError(t('validation.dimensionType', { label: heightLabel }))
      .required(t('validation.dimensionRequired', { label: heightLabel }))
      .integer(t('validation.heightInteger'))
      .min(200, t('validation.heightRange'))
      .max(2400, t('validation.heightRange')),
  })
}
