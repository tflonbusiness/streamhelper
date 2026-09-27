import type { TFunction } from 'i18next'
import * as yup from 'yup'
import { isValidIsoCurrencyCode } from '@/lib/iso-currencies'

function currencyCodeField(t: TFunction) {
  return yup
    .string()
    .required(t('validation.currencyRequired'))
    .test('iso', t('validation.selectValidCurrency'), (value) =>
      Boolean(value && isValidIsoCurrencyCode(value)),
    )
}

export function createBonusBuyFormSchema(t: TFunction) {
  return yup.object({
    currencyCode: currencyCodeField(t),
    name: yup
      .string()
      .trim()
      .required(t('validation.nameRequired'))
      .max(200, t('validation.nameMax200')),
    startBalance: yup
      .string()
      .required(t('validation.startBalanceRequired'))
      .matches(/^\d+(\.\d{1,2})?$/, t('validation.startBalanceDecimals'))
      .test('min', t('validation.startBalanceMin'), (value) => {
        if (!value) {
          return false
        }

        const parsed = Number.parseFloat(value)
        return Number.isFinite(parsed) && parsed >= 0
      }),
  })
}

export type CreateBonusBuyFormValues = yup.InferType<
  ReturnType<typeof createBonusBuyFormSchema>
>

export function createEditBonusBuySessionFormSchema(t: TFunction) {
  return yup.object({
    currencyCode: currencyCodeField(t),
    name: yup
      .string()
      .trim()
      .required(t('validation.nameRequired'))
      .max(200, t('validation.nameMax200')),
    startBalance: yup
      .string()
      .required(t('validation.startBalanceRequired'))
      .matches(/^\d+(\.\d{1,2})?$/, t('validation.startBalanceDecimals'))
      .test('min', t('validation.startBalanceMin'), (value) => {
        if (!value) {
          return false
        }

        const parsed = Number.parseFloat(value)
        return Number.isFinite(parsed) && parsed >= 0
      }),
  })
}

export type EditBonusBuySessionFormValues = yup.InferType<
  ReturnType<typeof createEditBonusBuySessionFormSchema>
>

function optionalMoneyField(t: TFunction, label: string) {
  return yup
    .string()
    .defined()
    .test(`${label}-empty`, t('validation.moneyValid', { label }), (value) => {
      const trimmed = (value ?? '').trim()
      if (!trimmed) {
        return true
      }

      const parsed = Number.parseFloat(trimmed)
      return Number.isFinite(parsed) && parsed >= 0
    })
    .test(
      `${label}-decimals`,
      t('validation.moneyDecimals', { label }),
      (value) => {
        const trimmed = (value ?? '').trim()
        if (!trimmed) {
          return true
        }

        return /^\d+(\.\d{1,2})?$/.test(trimmed)
      },
    )
}

export function createEditBonusBuySlotFormSchema(t: TFunction) {
  const winAmountLabel = t('validation.winAmount')
  return yup.object({
    name: yup
      .string()
      .trim()
      .required(t('validation.slotNameRequired'))
      .max(200, t('validation.slotNameMax200')),
    providerName: yup
      .string()
      .defined()
      .max(200, t('validation.usernameNoteMax200')),
    purchaseAmount: yup
      .string()
      .required(t('validation.purchaseAmountRequired'))
      .matches(/^\d+(\.\d{1,2})?$/, t('validation.purchaseAmountDecimals'))
      .test('min', t('validation.purchaseAmountMin'), (value) => {
        if (!value) {
          return false
        }

        const parsed = Number.parseFloat(value)
        return Number.isFinite(parsed) && parsed > 0
      }),
    winAmount: optionalMoneyField(t, winAmountLabel),
  })
}

export type EditBonusBuySlotFormValues = yup.InferType<
  ReturnType<typeof createEditBonusBuySlotFormSchema>
>

export function createBonusBuySlotFormSchema(t: TFunction) {
  return createEditBonusBuySlotFormSchema(t).pick([
    'name',
    'providerName',
    'purchaseAmount',
  ])
}

export type CreateBonusBuySlotFormValues = yup.InferType<
  ReturnType<typeof createBonusBuySlotFormSchema>
>
