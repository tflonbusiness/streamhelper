export const APP_LOCALES = ['en', 'ru'] as const

export type AppLocale = (typeof APP_LOCALES)[number]

export const LOCALE_STORAGE_KEY = 'caz-locale'

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (APP_LOCALES as readonly string[]).includes(value)
}

export function readStoredLocale(): AppLocale | null {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY)
    return isAppLocale(raw) ? raw : null
  } catch {
    return null
  }
}

export function writeStoredLocale(locale: AppLocale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // ignore
  }
}

export function detectBrowserLocale(): AppLocale {
  if (typeof navigator === 'undefined') {
    return 'en'
  }
  const lang = navigator.language?.toLowerCase() ?? ''
  if (lang.startsWith('ru')) {
    return 'ru'
  }
  return 'en'
}

/** Optional `?lang=en|ru` for OBS / shared links (not persisted server-side). */
export function readLocaleFromSearchParams(
  search = typeof window !== 'undefined' ? window.location.search : '',
): AppLocale | null {
  const value = new URLSearchParams(search).get('lang')
  return isAppLocale(value) ? value : null
}

export function resolveInitialLocale(
  stored?: AppLocale | null,
  search?: string,
): AppLocale {
  return readLocaleFromSearchParams(search) ?? stored ?? detectBrowserLocale()
}

export function resolveAppLocaleFromWindow(): AppLocale {
  if (typeof window === 'undefined') {
    return detectBrowserLocale()
  }
  return resolveInitialLocale(readStoredLocale(), window.location.search)
}
