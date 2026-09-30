import type { TFunction } from 'i18next'
import * as yup from 'yup'
import { WIDGET_KEYWORD_PREFIX_MAX_LENGTH } from '@/lib/chat-roll-session-settings'

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

export type ChatRollStreamWidgetSettingsFormValues = {
  widgetKeywordPrefix: string
}

export function createChatRollStreamWidgetSettingsFormSchema(t: TFunction) {
  return yup.object({
    widgetKeywordPrefix: yup
      .string()
      .trim()
      .required(t('chatRoll.widgetKeywordPrefixRequired'))
      .min(1, t('chatRoll.widgetKeywordPrefixRequired'))
      .max(
        WIDGET_KEYWORD_PREFIX_MAX_LENGTH,
        t('chatRoll.widgetKeywordPrefixRequired'),
      ),
  })
}
