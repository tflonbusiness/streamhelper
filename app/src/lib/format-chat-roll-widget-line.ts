export function formatChatRollWidgetLine(
  widgetKeywordPrefix: string,
  keyword: string,
): string {
  const prefix = widgetKeywordPrefix.trim()
  const word = keyword.trim()
  return `${prefix} - ${word}`
}
