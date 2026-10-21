import { widgetUiCopy } from '@/i18n/widget-ui'

export type PublicWidgetUnavailableReason =
  | 'no_live_session'
  | 'no_sessions'
  | 'subscription_expired'
  | 'entitlement_over_limit'

export type PublicWidgetModule =
  | 'bonusBuy'
  | 'prizeSpin'
  | 'chatRoll'
  | 'firstReaction'
  | 'mediaInteractive'

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
    if (module === 'firstReaction') {
      return widgetUiCopy.firstReactionNoSessions
    }
    return widgetUiCopy.prizeSpinNoSessions
  }

  if (reason === 'subscription_expired') {
    return widgetUiCopy.subscriptionExpired
  }

  if (reason === 'entitlement_over_limit') {
    return widgetUiCopy.entitlementOverLimit
  }

  if (module === 'bonusBuy') {
    return widgetUiCopy.bonusBuyNoLive
  }
  if (module === 'chatRoll') {
    return widgetUiCopy.chatRollNoLive
  }
  if (module === 'firstReaction') {
    return widgetUiCopy.firstReactionNoLive
  }
  return widgetUiCopy.prizeSpinNoLive
}
