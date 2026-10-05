import type { AppLocale } from '@/i18n/app-locale'
import ruFlag from './flags/ru.svg'
import usFlag from './flags/us.svg'

export const LOCALE_FLAG_SRC: Record<AppLocale, string> = {
  en: usFlag,
  ru: ruFlag,
}
