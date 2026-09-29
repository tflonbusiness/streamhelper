import { widgetUiCopy } from '@/i18n/widget-ui'

export type PublicWidgetUnavailableReason =
  | 'no_live_session'
  | 'no_sessions'

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

  return module === 'bonusBuy'
    ? widgetUiCopy.bonusBuyNoLive
    : widgetUiCopy.prizeSpinNoLive
}
