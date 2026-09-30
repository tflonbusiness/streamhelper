import { chatRollWidgetRoute } from '@/lib/routes'

export function buildChatRollOverlayPath(accountUcid: string): string {
  return chatRollWidgetRoute(accountUcid)
}

export function buildChatRollObsOverlayUrl(accountUcid: string): string {
  return `${window.location.origin}${buildChatRollOverlayPath(accountUcid)}`
}
