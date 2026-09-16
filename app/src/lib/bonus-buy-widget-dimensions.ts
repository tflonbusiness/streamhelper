export const BONUS_BUY_WIDGET_DEFAULT_WIDTH = 500
export const BONUS_BUY_WIDGET_DEFAULT_HEIGHT = 600
export const BONUS_BUY_WIDGET_MIN_DIMENSION = 200
export const BONUS_BUY_WIDGET_MAX_DIMENSION = 2400

export type BonusBuyWidgetDimensions = {
  width: number
  height: number
}

function parseDimension(value: string | null, fallback: number): number {
  if (!value) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return Math.min(
    BONUS_BUY_WIDGET_MAX_DIMENSION,
    Math.max(BONUS_BUY_WIDGET_MIN_DIMENSION, parsed),
  )
}

export function parseBonusBuyWidgetDimensions(
  searchParams: URLSearchParams,
): BonusBuyWidgetDimensions {
  return {
    width: parseDimension(
      searchParams.get('width') ?? searchParams.get('w'),
      BONUS_BUY_WIDGET_DEFAULT_WIDTH,
    ),
    height: parseDimension(
      searchParams.get('height') ?? searchParams.get('h'),
      BONUS_BUY_WIDGET_DEFAULT_HEIGHT,
    ),
  }
}

export function buildBonusBuyWidgetUrl(
  sessionId: string | number,
  dimensions?: Partial<BonusBuyWidgetDimensions>,
): string {
  const width = dimensions?.width ?? BONUS_BUY_WIDGET_DEFAULT_WIDTH
  const height = dimensions?.height ?? BONUS_BUY_WIDGET_DEFAULT_HEIGHT
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
  })

  return `/bonus-buy/${sessionId}/widget?${params.toString()}`
}
