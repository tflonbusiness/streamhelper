import { widgetUiCopy } from '@/i18n/widget-ui'

export type PublicWidgetUnavailableReason =
  | 'no_live_session'
  | 'no_sessions'
  | 'subscription_expired'

export type PublicWidgetModule = 'bonusBuy' | 'prizeSpin'

export function publicWidgetUnavailableMessage(
  module: PublicWidgetModule,
  reason: PublicWidgetUnavailableReason,
): string {
  if (reason === 'no_sessions') {
    return module === 'bonusBuy'
      ? widgetUiCopy.bonusBuyNoSessions
      : widgetUiCopy.prizeSpinNoSessions
  }

  if (reason === 'subscription_expired') {
    return widgetUiCopy.subscriptionExpired
  }

  return module === 'bonusBuy'
    ? widgetUiCopy.bonusBuyNoLive
    : widgetUiCopy.prizeSpinNoLive
}
