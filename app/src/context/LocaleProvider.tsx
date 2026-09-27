import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  isAppLocale,
  readStoredLocale,
  resolveInitialLocale,
  writeStoredLocale,
  type AppLocale,
} from '@/i18n/app-locale'
import { applyDocumentLocale } from '@/i18n/init-i18n'

type LocaleContextValue = {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()

  const locale: AppLocale = isAppLocale(i18n.language)
    ? i18n.language
    : resolveInitialLocale(readStoredLocale())

  useEffect(() => {
    applyDocumentLocale(locale)
  }, [locale])

  const setLocale = useCallback(
    (next: AppLocale) => {
      void i18n.changeLanguage(next)
      writeStoredLocale(next)
      applyDocumentLocale(next)
    },
    [i18n],
  )

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale])

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return context
}
