import dayjs from 'dayjs'
import { isAppLocale, type AppLocale } from '@/i18n/app-locale'
import i18n from '@/i18n/init-i18n'

const DATE_TIME_FORMAT: Record<AppLocale, string> = {
  en: 'MMM D, YYYY, h:mm A',
  ru: 'D.MM.YYYY, HH:mm',
}

function resolveFormatLocale(locale?: AppLocale): AppLocale {
  if (locale) {
    return locale
  }
  return isAppLocale(i18n.language) ? i18n.language : 'en'
}

/** Localized date + time (dayjs). */
export function formatDateTime(iso: string, locale?: AppLocale): string {
  const loc = resolveFormatLocale(locale)
  return dayjs(iso).format(DATE_TIME_FORMAT[loc])
}
