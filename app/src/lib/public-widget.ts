import { widgetUiCopy } from '@/i18n/widget-ui'

export type PublicWidgetUnavailableReason =
  | 'no_live_session'
  | 'no_sessions'
  | 'subscription_expired'

export type PublicWidgetModule = 'bonusBuy' | 'prizeSpin' | 'chatRoll'

export function publicWidgetUnavailableMessage(
  module: PublicWidgetModule,
  reason: PublicWidgetUnavailableReason,
): string {
  if (reason === 'no_sessions') {
    if (module === 'bonusBuy') {
      return widgetUiCopy.bonusBuyNoSessions
    }
    if (module === 'chatRoll') {
      return widgetUiCopy.chatRollNoSessions
    }
    return widgetUiCopy.prizeSpinNoSessions
  }

  if (reason === 'subscription_expired') {
    return widgetUiCopy.subscriptionExpired
  }

  if (module === 'bonusBuy') {
    return widgetUiCopy.bonusBuyNoLive
  }
  if (module === 'chatRoll') {
    return widgetUiCopy.chatRollNoLive
  }
  return widgetUiCopy.prizeSpinNoLive
}
