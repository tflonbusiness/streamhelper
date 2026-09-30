import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { applyDocumentLocale } from '@/i18n/init-i18n'

/** Stream overlays stay English regardless of dashboard locale. */
export const WIDGET_UI_LANGUAGE = 'en' as const

export const widgetUiCopy = {
  accountNotFound:
    'Account not found. Check the overlay URL in your dashboard.',
  sessionNotFound: 'Session not found',
  bonusBuyNoLive:
    'No bonus buy is live. Open the dashboard and tap Go live.',
  bonusBuyNoSessions:
    'No bonus buy session available. Create a session, then go live.',
  prizeSpinNoLive:
    'No prize spin is live. Open the dashboard and tap Go live.',
  prizeSpinNoSessions:
    'No prize spin session available. Create a session, then go live.',
  chatRollNoLive:
    'No chat roll is live. Open the dashboard and tap Go live.',
  chatRollNoSessions:
    'No chat roll session available. Create a session, then go live.',
  subscriptionExpired:
    'Team subscription inactive. Renew in the dashboard to restore this overlay.',
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
