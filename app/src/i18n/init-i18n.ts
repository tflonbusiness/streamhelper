import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { resolveAppLocaleFromWindow, type AppLocale } from '@/i18n/app-locale'
import { en } from '@/i18n/resources/en'
import { ru } from '@/i18n/resources/ru'

const initialLocale: AppLocale = resolveAppLocaleFromWindow()

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
  lng: initialLocale,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
})

export function applyDocumentLocale(locale: AppLocale): void {
  document.documentElement.lang = locale
}

applyDocumentLocale(initialLocale)

export default i18n
