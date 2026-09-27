import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { applyDocumentLocale } from '@/i18n/init-i18n'

/** Stream overlays stay English regardless of dashboard locale. */
export const WIDGET_UI_LANGUAGE = 'en' as const

export const widgetUiCopy = {
  sessionNotFound: 'Session not found',
  bonusBuyInactive:
    'Widget is not active because this bonus buy session has been disabled.',
  live: 'Live',
  prizeSpinAddSectors: 'Add sectors in dashboard',
  prizeSpinSpinning: 'Spinning',
  prizeSpinPrize: 'Prize',
} as const

export function usePinWidgetUiEnglish(): void {
  const { i18n } = useTranslation()

  useEffect(() => {
    if (i18n.language !== WIDGET_UI_LANGUAGE) {
      void i18n.changeLanguage(WIDGET_UI_LANGUAGE)
    }
    applyDocumentLocale(WIDGET_UI_LANGUAGE)
  }, [i18n])
}
