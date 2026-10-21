import type { PublicFirstReactionWidgetActiveView } from '@/api/first-reaction'
import {
  FIRST_REACTION_WIDGET_STYLE_DEFAULTS,
  type FirstReactionWidgetStyle,
} from '@/lib/first-reaction-widget-style-defaults'

export const FIRST_REACTION_WIDGET_PREVIEW_KEYWORD = 'JACKPOT'
export const FIRST_REACTION_WIDGET_PREVIEW_ACCEPT_SECONDS = 30

export function buildFirstReactionWidgetPreviewDemoView(
  width: number,
  height: number,
  startedAt: Date,
  style: FirstReactionWidgetStyle = FIRST_REACTION_WIDGET_STYLE_DEFAULTS,
): PublicFirstReactionWidgetActiveView {
  const deadline = new Date(
    startedAt.getTime() + FIRST_REACTION_WIDGET_PREVIEW_ACCEPT_SECONDS * 1000,
  )
  return {
    status: 'active',
    width,
    height,
    style,
    phase: 'accepting',
    keyword: FIRST_REACTION_WIDGET_PREVIEW_KEYWORD,
    acceptingStartedAt: startedAt.toISOString(),
    acceptDeadlineAt: deadline.toISOString(),
    winner: null,
  }
}
